// board.js
//	functions to read JSON from Trello Board 
//		and reorganize for ease of traversing for printing

var DB = {};
var JS = window;

function step1()
{
	initPref();

	var el = document.getElementById('TA');
	var buf = el.value;
	if (!buf.match(/idList/)){	
		alert('Please paste the JSON from your Trello Board into the text box');
		return;
	}

	readTrello(el.value);
	showPrefForm();
}

function readTrello(json)
{
	var pref_card = null;

	DB = { 
		raw: JSON.parse(json),
		listLookup: {}, listArr: [],
		cardLookup: {}, cardArr: [],
		whoLookup: {}
	};

	DB.raw = JSON.parse(json);

	// -- scan people
	var arr = DB.raw.members;
	for (var i=0; i<arr.length; i++){ 
		var obj = arr[i];
		DB.whoLookup[obj.fullName] = obj;
		DB.whoLookup[obj.id] = obj;
	}


	var arr = DB.raw.lists;
	for (var i=0; i<arr.length; i++){ 
		var obj = arr[i];
		var key = 'x'+obj.id;
		var j = DB.listArr.length;

		DB.listLookup[key] = obj;

		obj.cardArr = [];
		obj.listIndx = j;
		DB.listArr.push(obj);

//console.log(i,j,obj.id);

	}

	// -- scan cards - and add each card to its list
	var arr = DB.raw.cards;
	for (var i=0; i<arr.length; i++){ 
		var obj = arr[i];

		// need to wait until get prefs
		//if (obj.closed) continue;

		var key = 'x'+obj.id;
		obj.commArr = [];
		obj.cklistArr = [];
		obj.breakBool = false;

		DB.cardLookup[key] = obj;

		if (obj.name == prefCardTitle ) pref_card = obj;

		var key = 'x'+obj.idList;
		var lobj = DB.listLookup[key];
		lobj.cardArr.push(obj);

	}

	// -- scan actions - to pick up extra info
	var arr = DB.raw.actions;
	for (var i=0; i<arr.length; i++){ 
		var obj = arr[i];
//console.log(obj);

		if (!obj.data.card) continue;

		var key = 'x'+obj.data.card
		var cobj = DB.cardLookup['x'+obj.data.card.id];
		if (!cobj) continue;

		if (obj.type == 'createCard'){
			cobj.who = obj.memberCreator.fullName;
		}

		if (obj.type == 'commentCard'){ 
			cobj.commArr.push(obj);
			if (obj.data.text == 'skip-print-below-here'){
				cobj.breakBool = true;
			}
		}
		if (obj.type == 'copyCard'){
			var src = obj.data.cardSource.idShort;
			cobj.whox = 'copied from #' + src;
		}
	}

	// deferred until commArr populated
	if (pref_card) setPrefCard(pref_card);


	// -- scan checklists - and add it its card
	var arr = DB.raw.checklists;
	for (var i=0; i<arr.length; i++){ 
		var obj = arr[i];
//console.log('comment',i,obj);
		var key = 'x'+obj.idCard;
		var cobj = DB.cardLookup[key];
		if (!cobj) continue;
		cobj.cklistArr.push(obj);
	}

	for (var x in DB.cardLookup){
		var cobj = DB.cardLookup[x];
		if (cobj.cklistArr.length ==0) continue;
		cobj.cklistArr = cobj.cklistArr.sort( sort_by('pos'));

		// need to sort by position
		var arr = cobj.cklistArr;
		for (var i=0; i<arr.length; i++){
			var clobj = arr[i];
			clobj.checkItems = clobj.checkItems.sort( sort_by('pos'));
		}
	}

}

function sort_by(field,reverse,primer)
{
   // this returns a function for use in sort

   // ref: http://stackoverflow.com/questions
   //			/979256/sorting-an-array-of-javascript-objects
   var key = primer ? 
       function(x) {return primer(x[field])} : 
       function(x) {return x[field]};

   // convert boolean reverse to +1 or -1
   if (typeof reverse != 'undefined' && reverse) reverse = -1;
   else reverse = 1;

   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     } 

}

