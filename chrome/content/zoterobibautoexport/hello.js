Zotero.ZoteroBibAutoexport = {
  output: "collection.bib",
  translatorType: "9cb70025-a888-4a29-a210-93ec52da40d4",
  pending: null,
  init: function () {		
    // Register the callback in Zotero as an item observer
    var notifierID = Zotero.Notifier.registerObserver(this.notifierCallback, ['item']);
    
    // Unregister callback when the window closes (important to avoid a memory leak)
    window.addEventListener('unload', function(e) {
      Zotero.Notifier.unregisterObserver(notifierID);
    }, false);
  },
  doExport: function() {
    
    var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.zotero.');

    var file = Components.classes["@mozilla.org/file/directory_service;1"].
      getService(Components.interfaces.nsIProperties).
      get("CurProcD", Components.interfaces.nsIFile);

    //	var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);

    file.append(this.output);

    var recColl = prefs.getBoolPref('recursiveCollections');
    //	file.initWithPath(this.output);

    var zotero = Components.classes['@zotero.org/Zotero;1'].getService(Components.interfaces.nsISupports).wrappedJSObject;
    var collection = true;
    var translator = new zotero.Translate('export');
    // if (id != 0){ //not all collections
    //     collection = zotero.Collections.get(id);
    //     translator.setCollection(collection);
    // };
    if(collection){
      translator.setLocation(file);
      translator.setTranslator(this.translatorType);
      prefs.setBoolPref('recursiveCollections', true);
      translator.translate();
      prefs.setBoolPref('recursiveCollections', recColl);
    }
    
  },    
  // Callback implementing the notify() method to pass to the Notifier
  notifierCallback: {
    notify: function(event, type, ids, extraData) {
      var pendingMs = 15*1000;
      var clearPending = function() {
	clearInterval(Zotero.ZoteroBibAutoexport.pending);
	Zotero.ZoteroBibAutoexport.pending = null;
      };

      if (event == 'modify') {
	if (Zotero.ZoteroBibAutoexport.pending) {
	  clearPending()
	}

	Zotero.ZoteroBibAutoexport.pending = setInterval(function(){
	  clearPending();
	  Zotero.ZoteroBibAutoexport.doExport();
	}, pendingMs);

      }
    }
  }
};

// Initialize the utility
window.addEventListener('load', function(e) { Zotero.ZoteroBibAutoexport.init(); }, false);

