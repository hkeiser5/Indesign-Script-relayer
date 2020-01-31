/* JavaScript relayer Indd script 
written by Heather C Keiser, copyright 2020.
------------------------------------------------------------------

This script when run will reorgainize all text and pic frames into the following layers:

relayer-master_imagery: This layer will contain any frames & imagery that is contained on the master spreads

relayer-imagery: This layer will contain any frames & imagery on any pages/spreads

relayer-text_and_vectors: This layer will contain any text, vectors, possible logos (any groups of polygons are assumed to be logos)

relayer-markers_and_folios: This layer will contain text from master pages, and any text that contains a page marker or section marker in it from regular pages/spreads

Original layers are not deleted as there may be guides and such that get moved that are not included in this script. If this script is run on a file that already contains layers with these names, the items are just moved to these layers and no new layers are created.

------------------------------------------------------------------------------------*/


var myCurrentDoc = app.activeDocument; //selects current active document
//var myPages = myCurrentDoc.pages;  
//var myMasters = myCurrentDoc.masterSpreads;
var curLayers = myCurrentDoc.layers;
var newLayers = ['relayer-master_imagery','relayer-imagery','relayer-text_and_vectors','relayer-markers_and_folios'];
var allDocitems = myCurrentDoc.allPageItems;
var adiLength = allDocitems.length;
//remove items in groups from above
for (var mi =0; mi < adiLength; mi++){
	if ((allDocitems[mi].getElements()[0].parent instanceof Group)||(allDocitems[mi].getElements()[0] instanceof Image)){
		allDocitems.splice(mi,1);
		mi -= 1;
		adiLength -=1;
	//need to check if it is a group contained by a frame, if so remove it as well
	} else if ((allDocitems[mi].getElements()[0] instanceof Group)&&((allDocitems[mi].getElements()[0].parent instanceof Oval)||(allDocitems[mi].getElements()[0].parent instanceof Rectangle)||(allDocitems[mi].getElements()[0].parent instanceof Polygon))){
		allDocitems.splice(mi,1);
		mi -= 1;
		adiLength -=1;
	}
}


//create the new layers that everything will move to and push elements into them
for (var i=0; i<newLayers.length; i++){
	//need to check if layer already esists before adding
	var makeNewLayer = true;
	for (var old = 0; old < curLayers.length; old ++){
		if (curLayers[old].name === newLayers[i]){//layer already exists
			makeNewLayer = false;
		}
	}
	if (makeNewLayer === true){
		var myLayer = curLayers.add();
		myLayer.name = newLayers[i];
	}
	if (i === newLayers.length-1){
		//unlock all locked items and put them into an array
		for (var l = 0; l<allDocitems.length; l ++){
			var myType;
			var myPage;
			var myParent = allDocitems[l].getElements()[0].parent;//returned [Object Goup][Object Rectangle][Object Spread][Object MasterSpread]
			
			//set myPage
			if (allDocitems[l].getElements()[0].parent instanceof MasterSpread){
				myPage = 'Master';
			} else if (allDocitems[l].getElements()[0].parent instanceof Spread){
				myPage = 'Page';
			} else {//need to check parents parent use recursion.
				var foundParent = false;
				var myNewParent = myParent;
				while (foundParent === false){
					if (myNewParent.getElements()[0].parent instanceof MasterSpread){
						myPage = 'Master';
						foundParent = true;
					} else if (myNewParent.getElements()[0].parent instanceof Spread){
						myPage = 'Page';
						foundParent = true;
					} else {
						myNewParent = myNewParent.getElements()[0].parent;
					}
				}
			}
			//set myType
			if (allDocitems[l].getElements()[0] instanceof Group){
				myType = 'Group';
			} else if ((allDocitems[l].getElements()[0] instanceof ComboBox)||(allDocitems[l].getElements()[0] instanceof ListBox)||(allDocitems[l].getElements()[0] instanceof SignatureField)||(allDocitems[l].getElements()[0] instanceof XMLElement)){
				myType = 'basicText';
			} else if ((allDocitems[l].getElements()[0] instanceof TextFrame)||(allDocitems[l].getElements()[0] instanceof TextBox)){
				myType = 'markerText';	   
			} else {
				myType = 'Imagery';
			}
			
			//check if locked, if so unlock until after relayered
			var lockMe = false;
			if (allDocitems[l].locked === true){
				lockMe = true;
				allDocitems[l].locked = false;
			}
			placeLayer(allDocitems[l],myPage,myType);
			
			//relock item if needed
			if (lockMe === true){
				allDocitems.locked = true;
			}
		}
		
		//relayer
		//relayer(myMasters,true);
		//relayer(myPages,false);	
		
		
	}
}
//function to place item in correct layer
function placeLayer(item,pageType,itemType){
	if (itemType === 'Imagery'){
		if (pageType === 'Master'){
			item.itemLayer = curLayers.itemByName('relayer-master_imagery');
		}else{
			item.itemLayer = curLayers.itemByName('relayer-imagery');
		}
	} else if (itemType === 'basicText'){
		if (pageType === 'Master'){
			item.itemLayer = curLayers.itemByName('relayer-markers_and_folios');
		}else{
			item.itemLayer = curLayers.itemByName('relayer-text_and_vectors');			
		}
	} else if (itemType === 'markerText'){
		if (pageType === 'Master'){
			item.itemLayer = curLayers.itemByName('relayer-markers_and_folios');
		} else {
			if (yesMarker(item)){//has a marker
				item.itemLayer = curLayers.itemByName('relayer-markers_and_folios');
			} else {
				item.itemLayer = curLayers.itemByName('relayer-text_and_vectors');
			}
		}
		
	} else if (itemType === 'Group'){
		//need to check if it is a group of polygons, if so, likely a logo
		var myChildren = item.pageItems;
		var textOrLogo = false;
		var secMarker = false;
		var polyNum = 0;
		for (var g=0; g<myChildren.length; g++){//check if group elements are text image frames or polygons
			//see if the element is a polygon, if so add to total, and if more than 1 assume a logo
			if (myChildren[g].getElements()[0].constructor.name === 'Polygon'){
				//might be a logo
				polyNum ++;
			} else if (myChildren[g].getElements()[0].constructor.name === 'TextFrame'){//has text or logo in it
				textOrLogo = true;
				//see if the textframe has a marker.
				if (yesMarker(myChildren[g])){//has a marker{
					secMarker = true;
				}
			}
		}
		//depending on polynum, textor logo, and secMarker, put element on correct layer.
		if ((textOrLogo === true) || (polyNum > 1)){//determine if a section marker or just text/vectors
			if (pageType === 'Master'){
				item.itemLayer = curLayers.itemByName('relayer-markers_and_folios');
			} else {
				//if a secMarker false - regular text, otherwise it's a marker
				if (secMarker === false){
					item.itemLayer = curLayers.itemByName('relayer-text_and_vectors');
				} else {
					item.itemLayer = curLayers.itemByName('relayer-markers_and_folios');
				}
			}
		}
		
	}
}


//function if item is a textbox and contains a section marker or page marker
function yesMarker(pItem){
	if (pItem.getElements()[0].constructor.name === 'TextFrame'){
		//check if it has a marker in it
		var mychars = pItem.characters;
		for (var c = 0; c < mychars.length; c++){
			if (typeof mychars[c].contents === 'object'){//this might be a special character
				var mystring = String(mychars[c].contents);
				if ((mystring === 'PREVIOUS_PAGE_NUMBER')||(mystring === 'NEXT_PAGE_NUMBER')||(mystring === 'CURRENT_PAGE_NUMBER')||(mystring === 'AUTO_PAGE_NUMBER')||(mystring === 'SECTION_MARKER')){
					return true;
				}
			}
		}
		return false;
	} else {
		return false;
	}
}

//end relayer script
