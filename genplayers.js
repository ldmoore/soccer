//Player List
const players = [{
	name: "Arjun",
	skill: 0,
	pos_override: "striker"
}, {
	name: "Cassie",
	skill: 00
}, {
	name: "Clara",
	skill: 0
}, {
	name: "John",
	skill: 0,
	pos_override: "def"
}, {
	name: "Jonas",
	skill: 0
}, {
	name: "Risheek",
	skill: 0
}, {
	name: "Parker",
	skill: 9
}, {
	name: "Gyan",
	skill: 0
}, {
	name: "Arham",
	skill: 0
}, {
	name: "Cole",
	skill: 10
}, {
	name: "Nora",
	skill: 0
}, {
	name: "Reyaansh",
	skill: 0
}, {
	name: "Hawke",
	skill: 10
}, {
	name: "Anaya",
	skill: 0
}, {
	name: "Jonah",
	skill: 10
}];

Object.keys(players).forEach(p => {
	players[p].status = "";
	players[p].consecutive = 0;
	players[p].times_sideline = 0;
	players[p].times_playing = 0;
	players[p].rots_goalie = 0;
})

//Fetch Attending Players
function fetchAttendingPlayers() {
	let nameMap = Array.from(document.getElementsByClassName("player-check")).filter(c => c.checked).map(c => c.name);
	return players.filter(p => nameMap.includes(p.name))
}

//Generate Attendance List
let attendanceDiv = document.getElementById("playerAttendanceList");
players.forEach(p => {
	let playerCheck = document.createElement("input");
	playerCheck.type = "checkbox";
	playerCheck.name = p.name;
	playerCheck.id = `player_${p.name}`;
	playerCheck.value = "here";
	playerCheck.checked = true;
	playerCheck.classList.add("player-check");

	let playerCheckLabel = document.createElement("label");
	playerCheckLabel.for = `player_${p.name}`;
	playerCheckLabel.innerHTML = p.name;
	attendanceDiv.appendChild(playerCheck);
	attendanceDiv.appendChild(playerCheckLabel);
	attendanceDiv.appendChild(document.createElement("br"));
})

//Lineup state
const positionStates = {};
//Create starting lineup generator from structure
function createChart() {
	const structureNums = document.getElementsByClassName("structure");
	let positions = Array.from(structureNums).map(s => [s.labels[0].innerHTML, s.dataset.code, s.value]);
	let table = document.getElementById("linupAdjustTable");
	let playersHere = fetchAttendingPlayers();
	positions.forEach(p => {
		for (let i = 0; i < parseInt(p[2]); i++) {
		let playerDropdown = document.createElement("select");
		playerDropdown.setAttribute("onchange", "processStartPlayerChange(this)");;
		playerDropdown.classList.add("player-dropdown");
		playerDropdown.id = `${p[1]}${i}`
		playerDropdown.dataset.position = p[1];
		positionStates[`${p[1]}${i}`] = "noPlayer";
		
		let option = document.createElement("option");
			option.selected = true;
			option.value = "noPlayer";
			option.text = "No Player Selected";
			playerDropdown.appendChild(option);
			playersHere.forEach(pl => {
			let option = document.createElement("option");
			option.value = pl.name;
			option.text = pl.name;
			playerDropdown.appendChild(option);
		});

		let tr = document.createElement("tr");
		tr.dataset.position = `${p[1]}${[i]}`
		tr.id = `tr_${p[1]}${[i]}`
		tr.classList.add("table-tr");
		table.appendChild(tr);
		let nameTd = document.createElement("td");
		nameTd.innerHTML = i === 0 ? p[0] : "";
		tr.appendChild(nameTd);
		let selectTd = tr.appendChild(document.createElement("td"));
		selectTd.appendChild(playerDropdown);
		tr.appendChild(selectTd);

		document.getElementById("structureWrapDiv").style.display = "none";
		document.getElementById("lineupAdjustBox").hidden = false;
		}
	});
}

function processStartPlayerChange(select) {
	let oldValue = positionStates[select.id];
	if (oldValue === select.value) return;
		const playerSelects = document.getElementsByClassName("player-dropdown");
		Array.from(playerSelects).forEach(s => {
			if (s.id !== select.id) {
				if (select.value !== "noPlayer") Array.from(s.children).find(e => e.value === select.value).remove(); 
				if (oldValue !== "noPlayer") {
					let option = document.createElement("option");
					option.value = oldValue;
					option.text = oldValue;
					s.appendChild(option);
				}
			}
		});
		positionStates[select.id] = select.value;
}

function processSubPlayerChange(select) {
	let oldValue = positionStates[select.id];
	if (oldValue === select.value) return;
		const playerSelects = document.getElementsByClassName("player-dropdown");
		Array.from(playerSelects).forEach(s => {
			if (s.id !== select.id) {
				Array.from(s.children).find(e => e.value === select.value).remove(); 
					let option = document.createElement("option");
					option.value = oldValue;
					let player = players.find(p => p.name === oldValue);
					option.text = oldValue === s.dataset.switchFor ? "No Substitution Selected" : `${oldValue}${player.status !== "playing" ? " (Current Bench)" : ""}`;
					oldValue === s.dataset.switchFor ? s.prepend(option) : s.appendChild(option);
			}
		});
		positionStates[select.id] = select.value;
		let aPlayers = fetchAttendingPlayers();
	let numWithoutPos = aPlayers.filter(ap => ap.status === "sideline").map(ap => ap.name).filter(ap => !Object.values(positionStates).includes(ap)).length;
	if (numWithoutPos) {
		document.getElementById("benchedForMoreThanOne").hidden = false;
		document.getElementById("benchNum").innerHTML = numWithoutPos.toString();
	} else if (!document.getElementById("benchedForMoreThanOne").hidden) document.getElementById("benchedForMoreThanOne").hidden = true;
}

function generateLineup(hotswap) {
	const playerSelects = Array.from(document.getElementsByClassName("player-dropdown"));
	if (!playerSelects.every(s => s.value !== "noPlayer")) return document.getElementById("invalidLineup").hidden = false;
	if (document.getElementById("invalidLineup").hidden === false) document.getElementById("invalidLineup").hidden = true;
	const tableTrs = Array.from(document.getElementsByClassName("table-tr"));
	let aPlayers = fetchAttendingPlayers();
	let playerNames = aPlayers.filter(p => !Object.values(positionStates).includes(p.name));
	document.getElementById("lineupChange").innerHTML = "Process Substitution";
	document.getElementById("lineupHotswap").hidden = false;
	if (document.getElementById("historyWrap").hidden) document.getElementById("historyWrap").hidden = false;
	if (document.getElementById("playWrap").hidden) document.getElementById("playWrap").hidden = false;
	if (players.every(p => p.status === "")) {
		let newText = ["<strong>Original Lineup</strong>"];
		playerSelects.forEach(ps => {
			let pos = posNames[Object.keys(posNames).find(n => ps.id.startsWith(n))];
			newText.push(`${pos}: ${ps.value}`);
		});
		document.getElementById("history").innerHTML = newText.join("<br>");
	}
	addToSubHistory(playerSelects.filter(s => s.dataset.switchFor && s.value !== s.dataset.switchFor), hotswap);
	let names = playerSelects.map(p => p.value);
	for (let pl of players) {
		if (!aPlayers.find(a => a.name === pl.name)) continue;
		if (playerSelects.find(s => s.id === `goalie0`) && playerSelects.find(s => s.id === `goalie0`).value === pl.name) pl.goalie = true;
		if (playerSelects.find(s => s.id === `goalie0`) && pl.goalie && playerSelects.find(s => s.id === `goalie0`).value !== pl.name) {
			if (players.find(player => player.formerGoalie)) players.find(player => player.formerGoalie).formerGoalie = false;
			pl.formerGoalie = true;
			pl.goalie = false;
		}
		if (pl.goalie) {
			pl.status = "playing";
			pl.consecutive = 0;
			if (!hotswap) pl.rots_goalie++;
			continue;
		}
		if (names.includes(pl.name)) {
			//Playing
			if (pl.status !== "playing") {
				pl.consecutive = hotswap ? 0 : 1;
				pl.status = "playing";
			} else if (!hotswap) pl.consecutive++;
		} else {
			//Sideline
			if (pl.status !== "sideline") {
				pl.consecutive = hotswap ? 0 : 1;
				pl.status = "sideline";
			} else if (!hotswap) pl.consecutive++;
		}
		if (!hotswap) pl[`times_${pl.status}`]++;
	}
	let subSuggestions = suggestSubs();
	let processSubChangesPost = [];
	tableTrs.forEach(tr => {
		let children = Array.from(tr.children);
		for (let i = 0; i < children.length; i++) {
			if (i !== 0) children[i].remove();
		}
		let personTd = document.createElement("td");
		personTd.innerHTML = positionStates[tr.dataset.position];
		tr.appendChild(personTd);
		let arrowTd = document.createElement("td");
		arrowTd.innerHTML = "→";
		tr.appendChild(arrowTd);
		let playerDropdown = document.createElement("select");
		playerDropdown.setAttribute("onchange", "processSubPlayerChange(this)");;
		playerDropdown.classList.add("player-dropdown");
		playerDropdown.id = tr.dataset.position;
		playerDropdown.dataset.switchFor = positionStates[tr.dataset.position];
		playerDropdown.dataset.position = tr.dataset.position;
		
		let option = document.createElement("option");
			if (subSuggestions[positionStates[tr.dataset.position]]) option.selected = true;
			option.value = positionStates[tr.dataset.position];
			option.text = "No Substitution Selected";
			playerDropdown.appendChild(option);
			playerNames.forEach(pl => {
			let option = document.createElement("option");
			if (subSuggestions[positionStates[tr.dataset.position]] === pl.name) option.selected = true;
			option.value = pl.name;
			option.text = `${pl.name}${pl.status !== "playing" ? " (Current Bench)" : ""}`;
			playerDropdown.appendChild(option);
		});
		let selectTd = tr.appendChild(document.createElement("td"));
		selectTd.appendChild(playerDropdown);
		tr.appendChild(selectTd);
		processSubChangesPost.push(tr.dataset.position);
	});
	processSubChangesPost.forEach(trpos => {
		processSubPlayerChange(document.getElementById(trpos));
	});
	updatePlaytime();
}

let posNames = {
	"striker": "Striker",
	"cmid": "Center Mid",
	"omid": "Outside Mid",
	"def": "Defense",
	"goalie": "Goalie"
};

function addToSubHistory(newSubs, hotswap) {
	let newText = [];
	newSubs.forEach(ps => {
		let pos = posNames[Object.keys(posNames).find(n => ps.id.startsWith(n))];
		newText.push(`<span class="in">${ps.value}</span> <i class="material-icons">swap_horiz</i> <span class="out">${ps.dataset.switchFor}</span> <i>(${pos})</i>${hotswap ? ` <i class="out">(Hotswap)</i>` : ""}`);
	})
	if (!newText.length) return;
	
	let historyText = document.getElementById("history");
	historyText.innerHTML = `${newText.join("<br>")}<hr>${historyText.innerHTML}`
}

function updatePlaytime() {
	let aPlayers = fetchAttendingPlayers();
	document.getElementById("playHistory").innerHTML = aPlayers.map(p => `<strong>${p.name}</strong><br>&emsp;Rotations Played: ${p.times_playing}${p.status === "playing" && !p.goalie ? " <i>(Current)</i>" : ""}<br>&emsp;Rotations Benched: ${p.times_sideline}${p.status === "sideline" ? " <i>(Current)</i>" : ""}${p.rots_goalie > 0 ? `<br>&emsp;Rotations Goalie: ${p.rots_goalie}${p.goalie ? " <i>(Current)</i>" : ""}` : ""}<br>&emsp;Current Consecutive Streak: ${p.consecutive}${p.formerGoalie ? "<br>&emsp;<i>Former Goalie Promotion Enabled</i>" : ""}`).join("<br><br>");
}

function getPlayerPosition(player) {
	return Object.keys(positionStates).find(ps => positionStates[ps] === player.name).match(/([a-z]+)/)[1];
}

function suggestSubs() {
	let aPlayers = fetchAttendingPlayers();
	let availablePositionNum = Object.keys(positionStates).length;
	if (positionStates["goalie0"]) availablePositionNum--;
	let subs = players.filter(p => p.status !== "playing" && aPlayers.find(ap => ap.name === p.name)).sort(function (a, b) {
		if (b.consecutive !== a.consecutive) return (b.consecutive > a.consecutive) ? 1 : -1;
		else return (b.skill > a.skill) ? 1 : -1;
	}).slice(0, availablePositionNum);
	console.log(subs);
	let pos_override_subs = subs.filter(s => s.pos_override);
	let neededPositions = pos_override_subs.map(poso => poso.pos_override);
	let currentPlaying = players.filter(p => p.status === "playing");
	let subLine = currentPlaying.filter(p => !p.goalie).sort(function (a, b) {
		if (b.consecutive !== a.consecutive) return (b.consecutive > a.consecutive) ? 1 : -1;
		else if (b.formerGoalie) return -1;
		else if (a.formerGoalie) return 1;
		else if (neededPositions.includes(getPlayerPosition(a))) return -1;
		else if (neededPositions.includes(getPlayerPosition(b))) return 1;
		else return (a.skill > b.skill) ? 1 : -1;
	}).slice(0, subs.length);
	let availablePositions = {};
	let subSuggestions = {};
	subLine.forEach(inp => {
		availablePositions[getPlayerPosition(inp)] = inp.name;
	});
	for (let sub of pos_override_subs) {
		if (availablePositions[sub.pos_override]) {
			subSuggestions[availablePositions[sub.pos_override]] = sub.name;
			subs.splice(subs.findIndex(sl => sl.name === sub.name), 1);
			subLine.splice(subLine.findIndex(sl => sl.name === availablePositions[sub.pos_override]), 1);
			delete availablePositions[sub.pos_override];
		}
	}
	for (let sub of subs) {
		subSuggestions[subLine[0].name] = sub.name;
		subLine.shift();
	}
	return subSuggestions;
}