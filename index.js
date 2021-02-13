const SET_URL = "https://nicholas-miklaucic.github.io/greenglade-wisdom";
const SPEEDS = ["Burst", "Fast", "Slow", "Unit"];

const CARD_NAMES = [
    // Demacia
    "Ranger's Resolve",
    "Sharpsight",
    "Riposte",
    "Single Combat",
    "Concerted Strike",
    "Judgment",
    "Relentless Pursuit",
    "Radiant Guardian",
    // Frejlord
    "Brittle Steel",
    "Troll Chant",
    "Flash Freeze",
    "Harsh Winds",
    "Avalanche",
    "Icequake ", // Riot pls why
    // Ionia
    "Twin Disciplines",
    "Spirit's Refuge",
    "Flurry of Fists",
    "Nopeify!",
    "Deny",
    "Concussive Palm",
    // P&Z
    "Suit Up!",
    "Mystic Shot",
    "Get Excited!",
    "Statikk Shock",
    "Thermogenic Beam",
    "Tri-beam Improbulator",
    "Aftershock",
    // Noxus
    "Transfusion",
    "Brothers' Bond",
    "Ravenous Flock",
    "Culling Strike",
    "Scorched Earth",
    "Decisive Maneuver",
    "Death Lotus",
    "Noxian Fervor",
    "Decimate",
    "Arachnoid Sentry",
    // SI
    "Mark of the Isles",
    "Vile Feast",
    "Black Spear",
    "The Box",
    "Withering Wail",
    "Grasp of the Undying",
    "Vengeance",
    "The Harrowing",
    "The Ruination",
    "Frenzied Skitterer",
    // Bilgewater
    "Jettison",
    "Make it Rain",
    "Mind Meld",
    "Twisted Fate",
    "Devourer of the Depths",
    // Targon
    "Pale Cascade",
    "Hush",
    "Bastion",
    "Moonlight Affliction",
    "Gravitum",
    "Crescent Strike",
    "Meteor Shower",
    "Falling Comet",
    "Supernova",
    "Cosmic Rays",
    "The Serpent",
    "The Golden Sister",
];

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
      .attr("class", "column is-6-tablet is-3-desktop is-3-widescreen is-3-fullhd reg-col")
      .html(regionButton);
    d3.json(SET_URL + "/static/set1/en_us/data/set1-en_us.json", function(set1) {
        d3.json(SET_URL + "/static/set2/en_us/data/set2-en_us.json", function(set2) {
            d3.json(SET_URL + "/static/set3/en_us/data/set3-en_us.json", function(set3) {
                d3.json(SET_URL + "/static/hints.json", function(hints) {
                    console.log(hints);
                    const ALL_CARDS = set1.concat(set2.concat(set3));
                    let cards = d3.map(CARD_NAMES, name => findCardName(ALL_CARDS, name));

                    function setHint(card, hints) {
                        let hintText = hints[card.name];
                        if (hintText === undefined) {
                            hintText = hints["default"];
                        }
                        document.getElementById("hint-area").textContent = hintText;
                    }


                    function updateCards(cards) {
                        console.log("Updating...")
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
                        console.log("Hi");
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
