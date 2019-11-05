/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

var _urn, _projectid, _token;

$(document).ready(function () {
  // first, check if current visitor is signed in
  jQuery.ajax({
    url: '/api/forge/oauth/token',
    success: function (res) {
      _token = res.access_token;
      console.log(`TOKEN: ${res.access_token}`);      
      // yes, it is signed in...
      $('#signOut').show();
      $('#refreshHubs').show();
      $('#convertOTG').show();
      $('#statusOTG').show();

      // prepare sign out
      $('#signOut').click(function () {
        $('#hiddenFrame').on('load', function (event) {
          location.href = '/api/forge/oauth/signout';
        });
        $('#hiddenFrame').attr('src', 'https://accounts.autodesk.com/Authentication/LogOut');
        // learn more about this signout iframe at
        // https://forge.autodesk.com/blog/log-out-forge
      })

      // and refresh button
      $('#refreshHubs').click(function () {
        $('#userHubs').jstree(true).refresh();
      });

      // and refresh button
      $('#convertOTG').click(function () {

        var body = {"urn": _urn,
              "project_id":_projectid,
              "force_conversion": true
            };

        fetch('https://otg.autodesk.com/modeldata',
        {
            headers: {
              'Authorization': `Bearer ${_token}`,
              'Content-Type': 'application/json',
            },
            method: "POST",
            body: JSON.stringify(body)
        })
        .then(function(res){ console.log(res) })
        .catch(function(res){ console.log(res) })


      });

      // and refresh button
      $('#statusOTG').click(function () {
      });

      // finally:
      prepareUserHubsTree();
      showUser();
    }
  });

  $('#autodeskSigninButton').click(function () {
    jQuery.ajax({
      url: '/api/forge/oauth/url',
      success: function (url) {
        location.href = url;
      }
    });
  })
});

function prepareUserHubsTree() {
  $('#userHubs').jstree({
    'core': {
      'themes': { "icons": true },
      'multiple': false,
      'data': {
        "url": '/api/forge/datamanagement',
        "dataType": "json",
        'cache': false,
        'data': function (node) {
          $('#userHubs').jstree(true).toggle_node(node);
          return { "id": node.id };
        }
      }
    },
    'types': {
      'default': {
        'icon': 'glyphicon glyphicon-question-sign'
      },
      '#': {
        'icon': 'glyphicon glyphicon-user'
      },
      'hubs': {
        'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png'
      },
      'personalHub': {
        'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png'
      },
      'bim360Hubs': {
        'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360hub.png'
      },
      'bim360projects': {
        'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360project.png'
      },
      'a360projects': {
        'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360project.png'
      },
      'items': {
        'icon': 'glyphicon glyphicon-file'
      },
      'folders': {
        'icon': 'glyphicon glyphicon-folder-open'
      },
      'versions': {
        'icon': 'glyphicon glyphicon-time'
      },
      'unsupported': {
        'icon': 'glyphicon glyphicon-ban-circle'
      }
    },
    "plugins": ["types", "state", "sort"],
    "state": { "key": "autodeskHubs" }// key restore tree state
  }).bind("activate_node.jstree", function (evt, data) {
    if (data != null && data.node != null && data.node.type == 'versions') {
      _urn = data.node.id;
      _projectid = data.node.parent.split('/')[6];
      console.log(`ProjectID: ${_projectid}`);
      console.log(`URN: ${_urn}`);

      $("#forgeViewer").empty();
      fetchOTGStatus();
    }
  }).bind("dblclick.jstree", function (evt) {
    launchViewer(_urn);
  });
}

function fetchOTGStatus() {
    $("#statusOTG").text("...");
    fetch(`https://otg.autodesk.com/modeldata/manifest/${_urn}`,
    {
        headers: {
          'Authorization': `Bearer ${_token}`,
          'Content-Type': 'application/json',
        },
        method: "GET",
        mode: "cors",
        credentials: "include",
    })
    .then(res => res.json()).then(json => {
      console.log(json);
      var status = json.children[0].otg_manifest || json.children[1].otg_manifest;
      console.log(status);
      $("#statusOTG").text( (status) ? `OTG:${status.progress}` : "SVF" );

    })
    .catch(function(res){ console.log(res) })
}

function showUser() {
  jQuery.ajax({
    url: '/api/forge/user/profile',
    success: function (profile) {
      var img = '<img src="' + profile.picture + '" height="30px">';
      $('#userInfo').html(img + profile.name);
    }
  });
}
