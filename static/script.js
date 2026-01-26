const stor = window.localStorage;
const resources = new Map();
const res = {
    "Design": "Uses logs to give an early progress boost.",
    "Fabrication": "Provides a steady, reliable build rate.",
    "Electronics": "Slow to start, but powerful later on.",
    "Programming": "High risk, high reward randomized code.",
    "Operations": "A multiplier for all other subteams.",
    "Teams": "The ultimate multiplier for everything!",
    "Robots": "The currency of your robotics empire."
};

const prog = document.getElementById("prog");

class Resource {
    constructor(name) {
        this.name = name;
        this.obj = document.getElementById(name);
        if (this.obj) {
            this.obj.setAttribute('data-description', res[name] || "");
        }
        if (stor.getItem(this.name) === null) {
            stor.setItem(this.name, this.name === "Robots" ? "0" : "1");
        }
        this.update();
        if (
            this.name !== "Robots" &&
            this.name !== "Teams" &&
            !resources.has(this.name)
        ) {
            this.obj.insertAdjacentHTML(
                "afterend",
                "<button id=" + this.name + "But>Put to work</button>"
            );
            this.but = document.getElementById(this.name + "But");
            this.but.setAttribute('data-description', res[name] || "");
            const buttonPress = (e) => {
                if (getAsInt("Robots") < getAsInt("Teams")) {
                    alert("Not affordable");
                    return;
                }
                this.change(1);
                resources.get("Robots").change(-getAsInt("Teams"));
            };
            this.but.addEventListener("click", buttonPress);
        }
        resources.set(this.name, this);
    }

    change(amount) {
        stor.setItem(
            this.name,
            Math.max((parseInt(stor.getItem(this.name)) + parseInt(amount)), 0).toString()
        );
        this.update();
    }

    update() {
        this.obj.innerText = `${this.name}: ${getAsInt(this.name)}`;
    }
}

function getAsInt(name) {
    return parseInt(stor.getItem(name));
}

function updateRobotProgress() {
    // 1. Logarithmic Base (Electronics > Design initial advantage)
  // Electronics coefficient reduced significantly for steep early growth
  const electronicsContribution = Math.log2(getAsInt("Electronics") + 1) / 10.0; // Higher weight

  // Design coefficient is steeper than the original 12.5 but less than Electronics
  const designContribution = Math.log(getAsInt("Design") + 1) / 5.0;

  // 2. Linear Production (Fabrication == Programming average output)
  // Fabrication coefficient set to 1/20 = 0.05
  const fabContribution = getAsInt("Fabrication") / 20.0;

  // Programming coefficient adjusted so average (0.5 * Programming) / 10.0 = 0.05
  const progContribution = (getAsInt("Programming") * Math.random()) / 10.0;

  // 3. Multipliers (Scale everything)
  const opMultiplier = 1 + (getAsInt("Operations") - 1) / 5.0;

  let increment = (electronicsContribution + designContribution + fabContribution + progContribution)
                  * opMultiplier * getAsInt("Teams");
    let val =
        Number(prog.value) +
        increment;
    if (val >= 100) {
        val = 0;
        resources.get("Robots").change(1);
    }
    prog.value = val;
}

function update(value, key, map) {
    value.update();
}

//reset button
document.getElementById("reset").addEventListener("click", function (e) {
    stor.clear();
    location.reload();
});
// Init Resources
Object.keys(res).forEach(name => new Resource(name));

function gameLoop() {
    updateRobotProgress();
    requestAnimationFrame(gameLoop);
    if (
        document.getElementById("TeamsBut") === null &&
        getAsInt("Robots") > 852 * Math.pow(10, getAsInt("Teams") - 2)
    ) {
        resources
            .get("Teams")
            .obj.insertAdjacentHTML(
            "afterend",
            '<button id=TeamsBut>"We\'re building a team, not a robot"</button>'
        );
        const teamsBut = document.getElementById("TeamsBut");
        const buttonPress = (e) => {
            resources.forEach((val, key, map) => {
                switch (val.name) {
                    case "Teams":
                        val.change(1);
                        break;
                    case "Robots":
                        stor.setItem(val.name, "0");
                        break;
                    default:
                        stor.setItem(val.name, "1");
                }
            });
            teamsBut.remove();
        };
        teamsBut.addEventListener("click", buttonPress);
    }
}

// Update text 10 times per second instead of 60 for performance
setInterval(() => {
    resources.forEach(v => v.update());
}, 100);

requestAnimationFrame(gameLoop);
