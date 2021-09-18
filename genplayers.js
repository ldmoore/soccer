//Player List
const players = [{
	name: "Arjun",
	rank: 14
}, {
	name: "Cassie",
	rank: 11
}, {
	name: "Clara",
	rank: 10
}, {
	name: "John",
	rank: 4,
	aSquad: true
}, {
	name: "Jonas",
	rank: 7
}, {
	name: "Risheek",
	rank: 13
}, {
	name: "Parker",
	rank: 5,
	aSquad: true
}, {
	name: "Gyan",
	rank: 6
}, {
	name: "Arham",
	rank: 12
}, {
	name: "Cole",
	rank: 1,
	aSquad: true
}, {
	name: "Nora",
	rank: 8
}, {
	name: "Reyaansh",
	rank: 15
}, {
	name: "Hawke",
	rank: 2,
	aSquad: true
}, {
	name: "Anaya",
	rank: 9
}, {
	name: "Jonah",
	rank: 3,
	aSquad: true
}];

Object.keys(players).forEach(p => {
	players[p].status = "";
	players[p].consecutive = 0;
	players[p].times_sideline = 0;
	players[p].times_playing = 0;
	players[p].rots_goalie = 0;
	players[p].time_on_field = 0;
	players[p].play_history = {};
});

let subSuggestRemoveSafeguards = false;

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

function resetDrop(drop, drops) {
	for(var j = 0;j < drop.options.length;j++){
		console.log(`Attempting to remove ${drop.value} from ${drop.id}`)
		if(drop.options[j].value === drop.value){
			drop.options[j].selected = false;
		}
		if (Array.from(drop.options).find(o => o.value === drop.dataset.switchFor)) Array.from(drop.options).find(o => o.value === drop.dataset.switchFor).selected = true;
		else if (!Object.values(positionStates).includes(drop.dataset.switchFor)) {
			let option = document.createElement("option");
				option.value = drop.dataset.switchFor;
				option.text = "No Substitution Selected";
				drop.prepend(option);
		} else {
			console.debug(`Needing to remove ${drop.dataset.switchFor} from somewhere`)
			let repD = drops.find(d => d.value === drop.dataset.switchFor);
			resetDrop(repD, drops);
			processSubPlayerChange(repD);
			Array.from(drop.options).find(o => o.value === drop.dataset.switchFor).selected = true;
		}
	}
	processSubPlayerChange(drop);
}

function clearSubs() {
	let drops = Array.from(document.getElementsByClassName("player-dropdown"));
	for (let i = 0; i < drops.length; i++) {
		resetDrop(drops[i], drops);
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

let goalieDrop = document.getElementById("goalieSelectStart");
goalieDrop.id = `goalieDropdown`;
goalieDrop.dataset.position = `goalie0`;
		
		let option = document.createElement("option");
			option.selected = true;
			option.value = "noPlayer";
			option.text = "No Goalie Selected";
			goalieDrop.appendChild(option);
			players.forEach(pl => {
			let option = document.createElement("option");
			option.value = pl.name;
			option.text = pl.name;
			goalieDrop.appendChild(option);
		});

//Lineup state
const positionStates = {};
//Create starting lineup generator from structure
function createChart() {
	let processFirstSubChangesPost = [];
	const structureNums = document.getElementsByClassName("structure");
	let positions = Array.from(structureNums).map(s => [s.labels[0].innerHTML, s.dataset.code, s.value]);
	if (positions.find(p => p[1] === "goalie") && document.getElementById("goalieDropdown").value === "noPlayer") return document.getElementById("invalidGoalie").hidden = false;
	if (document.getElementById("invalidGoalie").hidden === false) document.getElementById("invalidGoalie").hidden = true;
	let table = document.getElementById("linupAdjustTable");
	let playersHere = fetchAttendingPlayers();
	if (positions.find(p => p[1] === "goalie") && document.getElementById("goalieDropdown").value !== "noPlayer") positionStates["goalie0"] = document.getElementById("goalieDropdown").value;
	//Quick loop to fill positionStates
	positions.forEach(p => {
		for (let i = 0; i < parseInt(p[2]); i++) {
			if (!positionStates[`${p[1]}${i}`]) positionStates[`${p[1]}${i}`] = `${p[1]}${i}`;
		}
	})
	let aSquadHere = playersHere.filter(p => p.aSquad && positionStates["goalie0"] !== p.name).sort((a, b) => a.rank - b.rank);
	let startingASquad = aSquadHere.slice(0, aSquadHere.length-(playersHere.length === players.length ? 2 : 1));
	let startingBSquad = playersHere.filter(p => !p.aSquad && positionStates["goalie0"] !== p.name).sort((a, b) => a.rank - b.rank).slice(0, Object.keys(positionStates).length-1-startingASquad.length);
	let lineup = startingASquad.concat(startingBSquad);
	let subSuggestions = suggestSubsFromLineupList(lineup, positionStates);
	console.log(subSuggestions)
	positions.forEach(p => {
		for (let i = 0; i < parseInt(p[2]); i++) {
		let playerDropdown = document.createElement("select");
		playerDropdown.setAttribute("onchange", "processStartPlayerChange(this)");;
		playerDropdown.classList.add("player-dropdown");
		playerDropdown.id = `${p[1]}${i}`
		playerDropdown.dataset.position = p[1];
		
		let option = document.createElement("option");
			option.value = "noPlayer";
			option.text = "No Player Selected";
			playerDropdown.appendChild(option);
			playersHere.forEach(pl => {
			let option = document.createElement("option");
			option.value = pl.name;
			if (subSuggestions[`${p[1]}${i}`] === pl.name || positionStates[`${p[1]}${i}`] === pl.name) option.selected = true;
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
		processFirstSubChangesPost.push(tr.dataset.position);

		document.getElementById("structureWrapDiv").style.display = "none";
		document.getElementById("lineupAdjustBox").hidden = false;
		}
	});

	processFirstSubChangesPost.forEach(trpos => {
		processStartPlayerChange(document.getElementById(trpos));
	});
}

function processStartPlayerChange(select) {
	let oldValue = positionStates[select.id];
	if (oldValue === select.value) return;
		const playerSelects = document.getElementsByClassName("player-dropdown");
		Array.from(playerSelects).forEach(s => {
			if (s.id !== select.id) {
				if (select.value !== "noPlayer" && Array.from(s.children).find(e => e.value === select.value)) Array.from(s.children).find(e => e.value === select.value).remove(); 
				if (oldValue !== "noPlayer" && players.find(p => p.name === oldValue)) {
					let option = document.createElement("option");
					option.value = oldValue;
					option.text = oldValue;
					s.appendChild(option);
				}
			}
		});
		positionStates[select.id] = select.value;
}

function processSubPlayerChange(select, dontTryReplace) {
	if (subSuggestRemoveSafeguards) return;
	let oldValue = positionStates[select.id];
	if (oldValue === select.value) return;
		const playerSelects = document.getElementsByClassName("player-dropdown");
		Array.from(playerSelects).forEach(s => {
			if (s.id !== select.id) {
				console.log(Array.from(s.children), "finding", select.value)
				if (Array.from(s.children).find(e => e.value === select.value)) Array.from(s.children).find(e => e.value === select.value).remove(); 
				if (Array.from(s.children).find(e => e.value === oldValue))	return;
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
	document.getElementById("lineupChange").innerHTML = "Process Substitution";
	document.getElementById("lineupHotswap").hidden = false;
	document.getElementById("lineupClearSubs").hidden = false;
	document.getElementById("benchListWrap").hidden = false;
	if (document.getElementById("historyWrap").hidden) document.getElementById("historyWrap").hidden = false;
	if (document.getElementById("playWrap").hidden) document.getElementById("playWrap").hidden = false;
	//If start, add to sub history
	if (players.every(p => p.status === "")) {
		let newText = ["<strong>Original Lineup</strong>"];
		playerSelects.forEach(ps => {
			let pos = posNames[Object.keys(posNames).find(n => ps.id.startsWith(n))];
			newText.push(`${pos}: ${ps.value}`);
		});
		document.getElementById("history").innerHTML = newText.join("<br>");
	}
	//Add regular switches to sub history
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
			if (!hotswap) {
				if (!pl.play_history[posInPlayHistory]) pl.play_history[posInPlayHistory] = 0;
				pl.play_history[posInPlayHistory]++;
			}
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

	//REGEN DROPDOWNS
	//dropdown should list all newly benched players
	let subSuggestions = suggestSubs();
	let playersOnBench = aPlayers.filter(pl => !Object.values(subSuggestions).includes(pl.name) && !pl.goalie);
	console.log(subSuggestions, playersOnBench)
	let processSubChangesPost = [];

	//Go through each position
	tableTrs.forEach(tr => {
		let children = Array.from(tr.children);
		for (let i = 0; i < children.length; i++) {
			if (i !== 0) children[i].remove();
			//Remove everything except first pos
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
		
		if (!subSuggestions[positionStates[tr.dataset.position]] || subSuggestions[positionStates[tr.dataset.position]] === positionStates[tr.dataset.position] || playersOnBench.find(pla => pla.name === positionStates[tr.dataset.position])) {
			let option = document.createElement("option");
				option.selected = (!subSuggestions[positionStates[tr.dataset.position]] || subSuggestions[positionStates[tr.dataset.position]] === positionStates[tr.dataset.position]) ? true : false;
				option.value = positionStates[tr.dataset.position];
				option.text = "No Substitution Selected";
				playerDropdown.appendChild(option);
		} 
		if (subSuggestions[positionStates[tr.dataset.position]] && subSuggestions[positionStates[tr.dataset.position]] !== positionStates[tr.dataset.position]) {
			let p = players.find(p => p.name === subSuggestions[positionStates[tr.dataset.position]])
			let option = document.createElement("option");
			option.selected = true;

			option.value = p.name;
			option.text = `${p.name}${p.status !== "playing" ? " (Current Bench)" : ""}`;
			playerDropdown.appendChild(option);
		}
		playersOnBench.forEach(pl => {
			if (pl.name === positionStates[tr.dataset.position]) return;
			let option = document.createElement("option");
			option.value = pl.name;
			option.text = `${pl.name}${pl.status !== "playing" ? " (Current Bench)" : ""}`;
			playerDropdown.appendChild(option);
		});
		let selectTd = tr.appendChild(document.createElement("td"));
		selectTd.appendChild(playerDropdown);
		tr.appendChild(selectTd);
		processSubChangesPost.push(tr.dataset.position);
	});
	console.log("FINISHED, re-adding safeguards")
	subSuggestRemoveSafeguards = false;
	processSubChangesPost.forEach(trpos => {
		processSubPlayerChange(document.getElementById(trpos), true);
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
	return Object.keys(positionStates).find(ps => positionStates[ps] === player.name);
}

function suggestSubs() {
	let aPlayers = fetchAttendingPlayers();
	let availablePositionNum = Object.keys(positionStates).length;
	if (positionStates["goalie0"]) availablePositionNum--;
	let subs = players.filter(p => p.status !== "playing" && aPlayers.find(ap => ap.name === p.name)).sort(function (a, b) {
		if (b.consecutive !== a.consecutive) return (b.consecutive > a.consecutive) ? 1 : -1;
		else return (b.rank > a.rank) ? 1 : -1;
	}).slice(0, availablePositionNum);
	let currentPlaying = players.filter(p => p.status === "playing");
	let posMap = {};
	currentPlaying.forEach(inp => {
		posMap[getPlayerPosition(inp)] = inp.name;
	});
	console.log(posMap);
	let subLine = currentPlaying.filter(p => !p.goalie).sort(function (a, b) {
		if (b.consecutive !== a.consecutive) return (b.consecutive > a.consecutive) ? 1 : -1;
		else if (b.formerGoalie) return -1;
		else if (a.formerGoalie) return 1;
		else return (b.rank > a.rank) ? 1 : -1;
	}).slice(0, subs.length);
	let newPlayerList = currentPlaying.filter(pl => !pl.goalie && !subLine.find(sp => sp.name === pl.name)).concat(subs);
	let subSuggestions = suggestSubsFromLineupList(newPlayerList, posMap);
	console.log(subSuggestions)
	subSuggestRemoveSafeguards = true;
	return subSuggestions;
}

function suggestSubsFromLineupList(lineup, posMap) {
	console.log(lineup, posMap)
	let suggestions = [];
	function checkDefenseAbility(player) {
		if (!player.play_history["def"] || player.play_history["def"] < 2) return true;
		else return false;
	}
	let filledPositions = [];
	function setPlayer (player, pos) {
		console.log(player.name, "sent to", pos, "PH", player.play_history);
		suggestions[posMap[pos]] = player.name;
		filledPositions.push(pos);
	}
	lineup = lineup.sort((a, b) => a.rank - b.rank);
	for (let i = 0; i < lineup.length; i++) {
		let player = lineup[i];
		console.log("Running for", player.name);
		//NOTE: i is nth player-1 due to array structure
		if (i === 0) setPlayer(player, checkDefenseAbility(player) ? "def0" : "cmid0");
		else if (i === 1) setPlayer(player, !filledPositions.includes("def0") && checkDefenseAbility(player) ? "def0" : (filledPositions.includes("cmid0") ? "cmid1" : "cmid0"));
		else if (i === 2) setPlayer(player, !filledPositions.includes("def0") && checkDefenseAbility(player) ? "def0" : "striker0");
		else if (i === 3) setPlayer(player, !filledPositions.includes("def0") && checkDefenseAbility(player) ? "def0" : (player.aSquad && !filledPositions.includes("striker0") ? "strker0" : (!filledPositions.includes("cmid1") ? "cmid1" : "omid0")));
		else if (i === 4) setPlayer(player, "def1");
		else if (i === 5) setPlayer(player, `omid${filledPositions.includes("omid0") ? "1" : "0"}`);
		else if (i === 6) setPlayer(player, !filledPositions.includes("striker0") ? "striker0" : `omid${filledPositions.includes("omid0") ? "1" : "0"}`);
	}
	return suggestions;
}