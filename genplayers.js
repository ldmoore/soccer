//Player List
const players = [{
	name: "Arjun",
	skill: 1,
	pos_override: ["striker", "omid"],
	force_override: true
}, {
	name: "Cassie",
	skill: 2
}, {
	name: "Clara",
	skill: 2
}, {
	name: "John",
	skill: 4
}, {
	name: "Jonas",
	skill: 2.5
}, {
	name: "Risheek",
	skill: 1.5,
	pos_override: ["striker", "omid"],
	force_override: true
}, {
	name: "Parker",
	skill: 3
}, {
	name: "Gyan",
	skill: 2.5
}, {
	name: "Arham",
	skill: 1.5
}, {
	name: "Cole",
	skill: 4
}, {
	name: "Nora",
	skill: 2.5
}, {
	name: "Reyaansh",
	skill: 1,
	pos_override: ["striker", "omid"],
	force_override: true
}, {
	name: "Hawke",
	skill: 4
}, {
	name: "Anaya",
	skill: 2
}, {
	name: "Jonah",
	skill: 4
}];

Object.keys(players).forEach(p => {
	players[p].status = "";
	players[p].consecutive = 0;
	players[p].times_sideline = 0;
	players[p].times_playing = 0;
	players[p].rots_goalie = 0;
	players[p].time_on_field = 0;
	players[p].play_history = {};
})

//Fetch Attending Players
function fetchAttendingPlayers() {
	let nameMap = Array.from(document.getElementsByClassName("player-check")).filter(c => c.checked).map(c => c.name);
	return players.filter(p => nameMap.includes(p.name))
}

function attendanceSelectAll() {
	let checks = document.getElementsByClassName("player-check");
	for (let i = 0; i < checks.length; i++) {
		checks[i].checked = true;
	}
}

function attendanceDeselectAll() {
	let checks = document.getElementsByClassName("player-check");
	for (let i = 0; i < checks.length; i++) {
		checks[i].checked = false;
	}
}

function clearSubs() {
	let drops = document.getElementsByClassName("player-dropdown");
	for (let i = 0; i < drops.length; i++) {
		for(var j = 0;j < drops[i].options.length;j++){
            if(drops[i].options[j].value === drops[i].value){
                drops[i].options[j].selected = false;
            }
			Array.from(drops[i].options).find(o => o.value === drops[i].dataset.switchFor).selected = true;
        }
		processSubPlayerChange(drops[i]);
	}
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
attendanceDiv.appendChild(document.createElement("br"));
let playerCheckSelectAll = document.createElement("button");
playerCheckSelectAll.innerHTML = "Mark All Attending";
playerCheckSelectAll.setAttribute("onclick", "attendanceSelectAll()");
playerCheckSelectAll.classList.add("ncbtn");
attendanceDiv.appendChild(playerCheckSelectAll);
let playerCheckDeselectAll = document.createElement("button");
playerCheckDeselectAll.innerHTML = "Mark All Not Attending";
playerCheckDeselectAll.setAttribute("onclick", "attendanceDeselectAll()");
playerCheckDeselectAll.classList.add("ncbtn");
attendanceDiv.appendChild(playerCheckDeselectAll);

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
	document.getElementById("benchedList").innerHTML = aPlayers.map(ap => ap.name).filter(ap => !Object.values(positionStates).includes(ap)).join("<br>");
}

let lastSubTime;

function generateLineup(hotswap) {
	const playerSelects = Array.from(document.getElementsByClassName("player-dropdown"));
	if (!playerSelects.every(s => s.value !== "noPlayer")) return document.getElementById("invalidLineup").hidden = false;
	if (document.getElementById("invalidLineup").hidden === false) document.getElementById("invalidLineup").hidden = true;
	const tableTrs = Array.from(document.getElementsByClassName("table-tr"));
	let aPlayers = fetchAttendingPlayers();
	let playerNames = aPlayers.filter(p => !Object.values(positionStates).includes(p.name));
	document.getElementById("lineupChange").innerHTML = "Process Substitution";
	document.getElementById("lineupHotswap").hidden = false;
	document.getElementById("lineupClearSubs").hidden = false;
	document.getElementById("benchListWrap").hidden = false;
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
			let posInPlayHistory = playerSelects.find(s => s.value === pl.name).id.match(/([a-z]+)/)[1];
			pl.play_history[posInPlayHistory] = pl.play_history[posInPlayHistory] ? pl.play_history[posInPlayHistory]++ : 1;
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
	playerNames = playerNames.concat(players.filter(p => !playerNames.find(pn => pn.name === p.name) && Object.values(subSuggestions).includes(p.name)));
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
			if (!subSuggestions[positionStates[tr.dataset.position]]) option.selected = true;
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
	let pos_override_subs = subs.filter(s => s.pos_override && s.pos_override.length);
	let neededPositions = [].concat.apply([], pos_override_subs.map(s => s.pos_override));
	let currentPlaying = players.filter(p => p.status === "playing");
	let subLine = currentPlaying.filter(p => !p.goalie).sort(function (a, b) {
		if (b.consecutive !== a.consecutive) return (b.consecutive > a.consecutive) ? 1 : -1;
		else if (b.formerGoalie) return -1;
		else if (a.formerGoalie) return 1;
		else if (neededPositions.includes(getPlayerPosition(a)) && neededPositions.includes(getPlayerPosition(b))) return (a.skill > b.skill) ? 1 : -1;
		else if (neededPositions.includes(getPlayerPosition(a))) return -1;
		else if (neededPositions.includes(getPlayerPosition(b))) return 1;
		else return (a.skill > b.skill) ? 1 : -1;
	}).slice(0, subs.length);
	console.debug(subLine.map(s => `${s.name}, ${s.skill}, ${s.consecutive}`).join("\n"));
	let availablePositions = {};
	let subSuggestions = {};
	subLine.forEach(inp => {
		availablePositions[getPlayerPosition(inp)] = inp.name;
	});
	for (let sub of pos_override_subs) {
		let subOutPos = Object.keys(availablePositions).find(pos => sub.pos_override.includes(pos));
		if (!subOutPos) continue;
			subSuggestions[availablePositions[subOutPos]] = sub.name;
			subs.splice(subs.findIndex(sl => sl.name === sub.name), 1);
			subLine.splice(subLine.findIndex(sl => sl.name === availablePositions[subOutPos]), 1);
			delete availablePositions[subOutPos];
	}
	for (let sub of subs) {
		subSuggestions[subLine[0].name] = sub.name;
		subLine.shift();
	}

	//Check for issues with force_override
	function swapPlayers (p1, p2) {
		console.log("trading", p1, p2)
		if (Object.values(subSuggestions).includes(p1) && Object.values(subSuggestions).includes(p2)) {
			let swapP2InFor = Object.keys(subSuggestions).find(k => subSuggestions[k] === p1);
			console.log(p2, "subbed in for", swapP2InFor);
			let swapP1InFor = Object.keys(subSuggestions).find(k => subSuggestions[k] === p2);
			console.log(p1, "subbed in for", swapP1InFor);
			subSuggestions[swapP2InFor] = p2;
			subSuggestions[swapP1InFor] = p1;
			return;
		} else {
			let valueAlreadyValue = Object.values(subSuggestions).includes(p1) ? p1 : p2;
			let valueNotValue = valueAlreadyValue === p1 ? p2 : p1;
			console.log(valueAlreadyValue, "is value but ", valueNotValue, "is not");
			console.log(valueAlreadyValue, "is", Object.keys(subSuggestions).find(k => subSuggestions[k] === valueAlreadyValue));
			subSuggestions[Object.keys(subSuggestions).find(k => subSuggestions[k] === valueAlreadyValue)] = valueNotValue;
			subSuggestions[valueNotValue] = valueAlreadyValue;
			return;
		}
	}
	console.log(pos_override_subs);
	for (let sub of pos_override_subs.filter(s => s.force_override)) {
		let subbedOut = Object.keys(subSuggestions).find(subOut => subSuggestions[subOut] === sub.name);
		console.log(subbedOut);
		if (!sub.pos_override.includes(getPlayerPosition({ name: subbedOut }))) {
			let posToTrade = getPlayerPosition({ name: subbedOut });
			console.log(posToTrade);
			//Shuffle on-field players
			/**
			 * If someone has NOT played [prevented position] and is in [wanted position] give it to them
			 * If everyone has played [prevented position], find [wanted position] who prefers [prevented position]
			 * Make a random choice
			 */
			let newPlayerList = currentPlaying.filter(pl => !pl.goalie).map(cp => !subSuggestions[cp.name] ? cp : players.find(p => p.name === subSuggestions[cp.name]));
			console.log(newPlayerList)
			//TODO make sure trading from selected player is within override specs
			if (newPlayerList.find(p => p.name !== sub.name && (p.force_override ? p.pos_override.includes(posToTrade) : true) && !Object.keys(p.play_history).includes(posToTrade) && sub.pos_override.includes(getPlayerPosition(p)))) swapPlayers(sub.name, newPlayerList.find(p => p.name !== sub.name && (p.force_override ? p.pos_override.includes(posToTrade) : true) && !Object.keys(p.play_history).includes(posToTrade) && sub.pos_override.includes(getPlayerPosition(p))).name);
			else if (newPlayerList.find(p => p.name !== sub.name && p.pos_override && p.pos_override.includes(posToTrade) && sub.pos_override.includes(getPlayerPosition(p)))) swapPlayers(sub.name, newPlayerList.find(p => p.name !== sub.name && p.pos_override && p.pos_override.includes(posToTrade) && sub.pos_override.includes(getPlayerPosition(p))).name);
			else if (newPlayerList.find(p => p.name !== sub.name && (p.force_override ? p.pos_override.includes(posToTrade) : true) && sub.pos_override.includes(getPlayerPosition(p)))) swapPlayers(sub.name, newPlayerList.find(p => p.name !== sub.name && (p.force_override ? p.pos_override.includes(posToTrade) : true) && sub.pos_override.includes(getPlayerPosition(p))).name);
			else swapPlayers(sub.name, newPlayerList.find(p => p.name !== sub.name && (p.force_override ? p.pos_override.includes(posToTrade) : true) && sub.pos_override.includes(getPlayerPosition(p))).name);
		}
	}

	return subSuggestions;
}