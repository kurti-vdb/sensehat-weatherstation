function ajaxProxy (ajaxUrl) {
    var self = this;
    this.ajaxUrl = ajaxUrl;  

    // -------------------------------------------
    // Method for populating table from json object
    // -------------------------------------------
    self.PopulateTable = function (populateHandler, handleError) {
                                     
        // Get weatherdata from server
        var lAjaxString = self.ajaxUrl;
        $.ajax({                
            url: lAjaxString,
            type: 'GET',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
        })
        .done(function (data) { 
            populateHandler (data)
        })
        .fail(function (data) { 
            handleError(data);
        });
    }
};