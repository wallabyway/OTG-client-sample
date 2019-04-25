# Load OTG with ForgeViewer sample



## Intro

This sample tells you how to trigger an SVF->OTG conversion, and then shows you how to view the OTG with ForgeViewer.  This repo is a fork of the [Learn Forge](http://learnforge.autodesk.io) nodejs viewhub tutorial.


## What is OTG?

### OTG de-duplication:
OTG uses a de-duplication process of meshes.  So think of a wall as a cube.  And many walls are just a cube that is squished and rotated into place.   So imagine all walls of a building represented by a single cube with many transforms.   This saves storage space (data transfer).  BUT....
It also significantly improves render performance, with GPU instancing.  You send a single cube mesh to the GPU and thousands of tiny transforms as a single draw-call, thus drawing signicantly more triangles per frame.

Similar to the cube primative for walls, the same thing happens for Re-Bar and hand-rails, it's mostly de-duplication of a 'cylindrical primitive'.

### OTG precision:
OTG (centered at the origin) can theoretically measure a 20km stretch at 4.6 micron precision, which is just equivalent to the limit of 32 bit float precision.
Currently, OTG uses a single double precision offset for each model.

Linear designs or geospatial models are yet to be validated with OTG.  We are looking for feedback.

### OTG viewer
OTG uses the same Forge Viewer, as before... just point the viewer to the new environment variable to 'fluent', [like this.](https://github.com/wallabyway/OTG-client-sample/blob/552c78b1fe8e1177f6694fd947a17fd189a8505b/public/js/ForgeViewer.js#L26-L29)... and the viewer will use OTG data, instead of SVF.

Here's what the node.js server / webpage looks like when it's running successfully...
![OTG-debug](https://user-images.githubusercontent.com/440241/56630579-ad02f580-6606-11e9-83e0-e213ff22ade0.png)


## Part 1 - Using the webpage (once you've got the Node.js server up and running)

#### Steps:
> Red Circle shows the "Status"

1. navigate the tree, to an .RVT file (or .NWD)
2. single click on a version.  The browser will fetch the 'OTG status' and display in the status section (menu bar at the top).
3. To open the file in the Forge-Viewer on the right, just double click the version (this works for both SVF or OTG).
4. To trigger an OTG conversion job, select the version, then click on the &#9889;
5. To check 'conversion progress', just occasionally single-click the version.

#### what does STATUS mean?

- will show 'SVF' if the file is still in SVF format
- will show 'OTG: 44%' for 44% progress on conversion to OTG
- will show 'OTG: complete' if the file has been converted to OTG. 

Once 'status' shows 'OTG:complete', try opening the file, by double clicking it.  

This will open the OTG file in the standard forge viewer (with some minor changes to the [options variable](https://github.com/wallabyway/OTG-client-sample/blob/552c78b1fe8e1177f6694fd947a17fd189a8505b/public/js/ForgeViewer.js#L26-L29)
).
To make sure it is loading OTG, look at the chrome debug network console, select 'WS', and look for web-sockets.  That's how OTG transfers mesh data.
You should hopefully also notice that the file loads much faster.  That's because it's now loading OTG rather than SVF (more noticable for large things).

If you are experiencing stalling during loading with OTG, check the console for web-socket time-out error messages. You can try adding `?disableIndexedDb=true` as a URN parameter, to see if that fixes the problem.


## Part 2 - Starting the Node.js server


> you'll need this to bypass the Autodesk white-list, for the time being (oddly enough, Chrome browsers allow `localhost:3000`, but safari doesn't )...

1. in your `/etc/HOSTS` file, add `127.0.0.1 b360.autodesk.com`


2. create a quick `start.sh` script with your Forge App clientID and secret, like this:

```
export FORGE_CLIENT_ID=xxxx
export FORGE_CLIENT_SECRET=xxxx
#export FORGE_CALLBACK_URL=http://localhost:3000/api/forge/callback/oauth
export FORGE_CALLBACK_URL=http://b360.autodesk.com:3000/api/forge/callback/oauth
node start.js
open "http://b360.autodesk.com:3000/index.html"
```

2. in your Forge Account, add the URL `http://b360.autodesk.com:3000/api/forge/callback/oauth` to your Forge App's callback.
4. install node package stuff with `npm install`
4. now run the script `sh ./start.sh`

> Your node.js server will start and a browser should popup to your homepage.

3. click login and sign in to your A360 account
4. navigate to your SVF file
5. open it, as normal.
6. the OTG version should now load.  

> That's it ! 

> You can check that OTG is loading in ForgeViewer, by looking for a websocket connections.  OTG currently uses multiple websockets to load mesh bits.


## Troubleshooting

### empty Tree-list

If you get an empty tree-view, then try this...
1. Log into A360, you may need to create a new account first: http://a360.autodesk.com
2. If you have a BIM360 admin access, then you will need to connect BIM360 to your server (project auth access)... Read this blog post: https://fieldofviewblog.wordpress.com/2017/01/19/bim-360-activating-api-access-to-docs/

### Converting using POSTMAN, instead of the 'convert' button

Steps

1. steal a bearer TOKEN from this nodejs sample app (see chrome console log)

Now inside POSTMAN...

1. import the script (https://github.com/wallabyway/OTG-client-sample/blob/master/OTG-Service.postman_collection.json)
4. in the POSTMAN variables, add the token into `{{OTG_TOKEN}}` 
5. click on a file/version, and grab the URN and projectID from the console
6. add URN to the POSTMAN variable `{{OTG_URN}}`
7. add projectID to the POSTMAN variable `PROJECT_ID`
7. go to `POST job OTG` and click 'send'

<img alt="POSTjobOTG" src="https://user-images.githubusercontent.com/440241/54336971-c4ec6000-45ea-11e9-944e-b30cee2ccc6e.png">

You should hopefully get this json response...

```
{
    "version": 1,
    "type": "convertOtg",
    "request_id": "9cfcf6ad-5b1c-46da-b926-28b5fa62092b",
    "received_at": "2019-03-12T21:13:45.335Z",
    "status": "pending",
    "success": "0%",
    "progress": "0%"
}
```

now to check for progress...

7. send `GET manifest` in POSTMAN, and in the JSON response, do a search for `OTG-manifest` and sub item `progress`

<img alt="GETmanifestOTG" src="https://user-images.githubusercontent.com/440241/54336970-c158d900-45ea-11e9-8100-d578eba1da42.png">

 - once `progress` reaches 100%, you're done !  The SVF has been converted to OTG.  

 > Note, for BIM360-design-collaboration hosted files, this conversion process is automatically triggered when a file changes.


# Further Reading



Autodesk University 2018: [Creating Offline Workflows with ForgeViewer](https://www.autodesk.com/autodesk-university/class/Creating-Flexible-Offline-Workflows-Using-Autodesk-Forge-2018)

* See the SVF section, to understand how SVF works... There are some similarities with OTG worth noting...

![test](https://user-images.githubusercontent.com/440241/54336653-ded97300-45e9-11e9-8533-197b97460a39.jpg)


Documentation:

- [BIM 360 API](https://developer.autodesk.com/en/docs/bim360/v1/overview/) and [App Provisioning](https://forge.autodesk.com/blog/bim-360-docs-provisioning-forge-apps)
- [Data Management API](https://developer.autodesk.com/en/docs/data/v2/overview/)
- [Viewer](https://developer.autodesk.com/en/docs/viewer/v6)

### Tips & Tricks

For local development/testing, consider use [nodemon](https://www.npmjs.com/package/nodemon) package, which auto restart your node application after any modification on your code. To install it, use:

    sudo npm install -g nodemon

Then, instead of **npm run dev**, use the following:

    npm run nodemon

Which executes **nodemon server.js --ignore www/**, where the **--ignore** parameter indicates that the app should not restart if files under **www** folder are modified.

### Troubleshooting

After installing Github desktop for Windows, on the Git Shell, if you see a ***error setting certificate verify locations*** error, use the following:

    git config --global http.sslverify "false"

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

