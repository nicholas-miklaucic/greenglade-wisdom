// const SET_URL = "http://0.0.0.0:8000";
const SET_URL = "https://nicholas-miklaucic.github.io/greenglade-wisdom";
const SPEEDS = ["Burst", "Fast", "Slow", "Unit", "Focus"];
const DEFAULT_HINT = "This is where explanatory text about what decks run this card and how to play around it will be.";

function findCardName(cards, name) {
    for (let card of cards) {
        if (card.name === name) {
            return card;
        }
    }
    throw "Card name '" + name + "' is not defined";
}

function cardToHTML(card) {
    return `
<figure class="is-4by3 card-img">
  <img src="${card.assets[0].gameAbsolutePath}">
</figure>
`
}

function cardSpeed(card) {
    if (card.type == "Spell") {
        return card.spellSpeed;
    } else {
        return "Unit";
    }
}

function regionButton(reg) {
    return `
<label class="checkbox">
<input type="checkbox" id="${reg.nameRef}-check" name="${reg.nameRef}-check" class="reg-selector" checked>
<img class="region-icon" src="${reg.iconAbsolutePath}">
</figure> ${reg.name}
</label>
`
}

let mana = document.getElementById("mana");
let manaNum = document.getElementById("manaNum");
mana.addEventListener("change", function() {
    manaNum.value = mana.value;
});

manaNum.addEventListener("change", function() {
    mana.value = manaNum.value;
});


d3.json(SET_URL + "/static/global/en_us/data/globals-en_us.json", function(globals) {
    d3.select("#regions-select")
      .selectAll(".reg-col")
      .data(globals.regions.sort((a, b) => d3.ascending(a.name, b.name)))
      .enter()
      .append("div")
      .attr("class", "column is-6-tablet is-4-desktop is-4-widescreen is-4-fullhd reg-col")
      .html(regionButton);
    d3.json(SET_URL + "/static/set1/en_us/data/set1-en_us.json", function(set1) {
        d3.json(SET_URL + "/static/set2/en_us/data/set2-en_us.json", function(set2) {
            d3.json(SET_URL + "/static/set3/en_us/data/set3-en_us.json", function(set3) {
                d3.json(SET_URL + "/static/set4/en_us/data/set4-en_us.json", function(set4) {
                    d3.csv(SET_URL + "/static/hints.csv", function(hints) {
                        const ALL_CARDS = set1.concat(set2.concat(set3.concat(set4)));
                        let cards = d3.map(
                            d3.filter(hints, row => row["Card Name"][0] !== "_"), 
                            row => findCardName(ALL_CARDS, row["Card Name"]));

                        function setHint(card, hints) {
                            let hintText = DEFAULT_HINT;
                            for (let row of hints) {
                                if (row["Card Name"] === card.name) {
                                    hintText = row["Hint Text"];
                                }
                            }
                            document.getElementById("hint-area").textContent = hintText;
                        }


                        function updateCards(cards) {
                            for (let speed of SPEEDS) {
                                let cardObjs = d3.select("#cards-" + speed.toLowerCase())
                                                 .selectAll("div.column")
                                                 .data(d3.filter(cards, card => cardSpeed(card) === speed), d => d.cardCode);
                                cardObjs.enter()
                                        .append("div")
                                        .attr("class", "column is-12-desktop is-6-widescreen is-6-fullhd")
                                        .attr("id", card => card.cardCode)
                                        .html(cardToHTML)
                                        .on("mouseover", card => setHint(card, hints));
                                cardObjs.exit()
                                        .remove();
                            }
                        }
                        function update() {
                            newData = d3.filter(cards, card => d3.select("#" + card.regionRef + "-check").property("checked"));
                            newData = d3.filter(newData, card => card.cost <= d3.select("#mana").property("value"));
                            newData = newData.sort((a, b) => d3.ascending(a.cost, b.cost));
                            updateCards(newData);
                        };
                        d3.selectAll(".reg-selector")
                          .on("change", update);
                        d3.select("#mana").on("change", update);
                        update();
                        setHint({"name": "default"}, hints);
                    });
                });
            });
        });
    });
});
