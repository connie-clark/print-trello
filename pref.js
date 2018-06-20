// pref.js - functions to import/show/save/export printing preferences


function initPref()
{
	prefCard == null;
}

var prefCardTitle = 'MY~PRINT~PREFERENCES';
var prefArr;
var prefCardOrig;	// (optional)trello card containing preferences
var prefCard;		// (optional)trello card containing preferences
			//  -- it will be set by board.js/readTrello

var prefVal;  		// current preferences

var prefSpec = [

  { type: 'fieldset', name: 'Board' },

  { key: 'showBoardTitle', 
		name: 'Show Board Title',
		dflt: true },

  { type: 'fieldset', name: 'Lists'},

  { key: 'numberLists', 
		name: 'Sequentially number lists',
		dflt: false },

  { key: 'showListTitle', 
		name: 'Show List Title',
		dflt: true },


  { key: 'startListOnNewPage', 
		name: 'Start each list on new page',
		dflt: true },

  { key: 'prefaceListNameWithBoard', 
		name: 'Repeat board name when showing list name',
		dflt: false },

  { key: 'showSingleList', 
		name: 'Show option to print list by itself',
		dflt: true },

  { key: 'showClosedLists', 
		name: 'Show closed lists',
		dflt: false },


  { name: 'Cards', type: 'fieldset'},

  { key: 'numberCardsInList', 
		name: 'Sequentially number cards within each list',
		dflt: false },

  { key: 'showCardTitle', 
		name: 'Show Card Title',
		dflt: true },

  { key: 'showCardNumber', 
		name: 'Show Card Id #',
		dflt: true },

  { key: 'showCardLabels', 
		name: 'Show Card Label',
		type: 'pulldown',
		options: [
			'do-not-show',
			'plain-text',
			'show-color-block',
			'colored-text',
			'text-in-colored-block'
			],
		dflt: 'colored-text' },


  { key: 'showCardMembers', 
		name: 'Show Card Members',
		type: 'pulldown',
		options: [
			'do-not-show',
			'show-initials',
			'show-fullnames'
			],
		dflt: 'do-not-show' },

  { key: 'showVoteCount', 
		name: 'Show vote count',
		dflt: true },

  { key: 'showDueDate', 
		name: 'Show Due Date',
		dflt: true },

  { key: 'showCardCreator', 
		name: 'Show Card Creator',
		dflt: true },

  { key: 'showCardDesc', 
		name: 'Show Card Description',
		dflt: true },

  { key: 'showClosedCards', 
		name: 'Show Closed Cards',
		dflt: false },

  { type: 'fieldset', name: 'Checklists' },

  { key: 'showChecklists', 
		name: 'Show Checklists',
		dflt: true },

  { key: 'showChecklistTitle', 
		name: 'Show Checklist Title',
		dflt: true },

  { key: 'showChecklistItems', 
		name: 'Which Checklist Items to show',
		type: 'pulldown',
		options: [
			'none',
			'all',
			'unchecked-only',
			'checked-only'],
		dflt: 'all' },


  { type: 'fieldset', name: 'Comments' }, 

  { key: 'showComments', 
		name: 'Show Comments',
		dflt: true },

  { key: 'showCommentCreator', 
		name: 'Show Comment Creator',
		dflt: true },

  { key: 'showCommentDate', 
		name: 'Show Comment Date',
		dflt: false },
			
  { type: 'fieldset', name: 'People' },

  { key: 'showPersonAs', 
		name: 'When showing people, use',
		type: 'pulldown',
		options: [
			'initials',
			'fullname',
			'do-not-show'
			],
		dflt: 'initials' },

  { key: 'skipCreatorBefore',
		name: 'Skip names for entries before yyyy-mm-dd', 
		type: 'text',
		dflt: '' }
		

];


function setPrefCard(obj)
{
	if (obj.commArr.length == 0){
		alert('Detected card ' 
				+ prefCardTitle 
				+ '\nbut it does not contain comments'
				+ '\nwith previously saved (json) preferences'
				);
		prefCardOrig = obj;
		prefCard = null;
		return;
	}
	prefCard = obj;
	prefCard.selectedIndex = 0;

	prefCard.parsedJson = [];
	var arr = prefCard.commArr;
	for (var i=0; i<arr.length; i++){
		try {
			var obj = JSON.parse(arr[i].data.text);
			prefCard.parsedJson[i] = obj;
		}
		catch(e){
			alert('error parsing json from '+prefCardTitle+' '+i 
			+ '\n' + 'Are you missing " marks around your nickname?'
			+ '\n\n' + arr[i].data.text);
			continue;
		}
	}
}

function deltaPref(indx)
{
	prefCard.selectedIndex = indx;
	showPrefForm();
}


function showPrefForm()
{
	var pbool = false;

	prefArr = {};

	var htm = [];

	if (prefCard){
		var arr = prefCard.parsedJson;
		var htm = ['Saved preferences from ' +prefCardTitle+ ' card: '];
		var cnt = 0;
		for (var i=0; i<arr.length; i++){
			var obj = arr[i];
			if (obj){ 
				++cnt;
				htm.push('<a href=javascript:deltaPref(',
				i,')>', i+1, ' ', obj.nickname, '</a> &nbsp;');
			}
		}
		if (cnt == 0) htm.push(' <span class=hilite>NONE found - using factory defaults</span>');
		htm.push('<hr>');

		pbool = true;

		var tmp = prefCard.parsedJson[prefCard.selectedIndex];
		if (typeof tmp == 'object') prefArr = tmp;

	}

	// -- not using this anymore
	var el = document.getElementById('prefJsonIN');
	if (el && el.value.match(/{/)){	// }
		pbool = true;
		prefArr = JSON.parse(el.value);
	}

	var fsprev = '';
	htm.push('<form>');
	for (var i=0; i<prefSpec.length; i++){
		var obj = prefSpec[i];

		if (obj.type  == 'fieldset'){
			htm.push(fsprev,'<fieldset><legend>',obj.name,'</legend>');
			fsprev = '</fieldset>';
			continue;
		}

		var x = obj.key;
		var dflt = obj.dflt;

		if (pbool && typeof prefArr[x] != 'undefined'){
			dflt = prefArr[x];
//console.log(' -->',dflt);
		}

		if (typeof obj.dflt == 'boolean'){

			var ckd = '';  if (dflt) ckd = ' CHECKED ';
			htm.push('<p><input type=checkbox name=',x, ckd,'>&nbsp;',obj.name);
			continue;
		}

		if (obj.type == 'pulldown'){
			htm.push('<p> &nbsp; ',obj.name, ' <select name=',x,'>');
			var opt = obj.options;
			for (var j=0; j<opt.length; j++){
				var val = opt[j];
				var ckd = '';
				if (val == dflt) ckd = ' SELECTED ';
				htm.push('<option', ckd,'>',val,'</option>');
			}
			htm.push('</select>');
		}

		if (obj.type == 'text'){
			htm.push('<p> &nbsp; ',obj.name, 
				' <input type=text name=',x, ' value="', dflt,  '">');
		}
	}
	htm.push(fsprev);
	htm.push('<input type=button onClick=savePref(this.form) value=" Save Preferences & Create the Report">');
	htm.push('</form>');

	var el = document.getElementById('PREF_FORM');
	el.innerHTML = htm.join('');

	var el = document.getElementById('prefDiv');
	el.style.display = 'block';

}


function savePref(f)
{
	prefVal = { nickname: 'nickname goes here' };
	for (var i=0; i<prefSpec.length; i++){ 
		var obj = prefSpec[i];
		if (obj.type == 'fieldset') continue;

		var x = obj.key;

		if (typeof obj.dflt == 'boolean'){
			prefVal[x] = f[x].checked; continue;
		}

		if (obj.type == 'pulldown'){
			var opts = f[x].options;
			var indx = f[x].selectedIndex;
			prefVal[x] = opts[indx].value;
		}

		if (obj.type == 'text'){
			prefVal[x] = f[x].value; continue;
		}
	}
//console.log(prefVal);

	var el = document.getElementById('prefJsonOUT');
	el.value = JSON.stringify(prefVal,null,'  ');

	var el = document.getElementById('prefJsonDiv');
	el.style.display = 'block';

	dpyTrello();
}

