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
    let val =
        Number(prog.value) +
        (Math.log2(getAsInt("Design") + 1) / 12.5 +
            getAsInt("Fabrication") / 25.0 +
            Math.log(getAsInt("Electronics") + 1) / Math.log(1.04) / 200.0 +
            (getAsInt("Programming") * Math.random()) / 15) *
        (1 + (getAsInt("Operations") - 1) / 5.0) *
        getAsInt("Teams");
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
