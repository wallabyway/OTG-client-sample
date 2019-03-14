# Load OTG with ForgeViewer sample


## Intro

This sample tells you how to trigger an SVF->OTG conversion, and then shows you how to view the OTG with ForgeViewer.  This repo is a fork of the [Learn Forge](http://learnforge.autodesk.io) nodejs viewhub tutorial.

<img alt="OTG-viewer" src="https://user-images.githubusercontent.com/440241/54336099-4a224580-45e8-11e9-9691-88a060d38d11.png">


## Part 1 - Converting

Steps

1. steal a BEARER token from A360 (run the nodejs server in part2 in the debug console after clicking on an design file)

Now inside POSTMAN...

1. import the script (provided)
4. feed the token into `{{OTG_TOKEN}}` variable
5. find a URN SVF you want to convert and add it to the POSTMAN variable `{{OTG_URN}}` (again, use the node server and click on your 3D design file and look in chrome debug console)
6. run the `POST OTG-job` to trigger the SVF->OTG converter
7. now run `GET manifest` in POSTMAN, and in the JSON response, look for OTG `progress`
 - once `progress` reaches 100%, you're done !  The SVF has been converted to OTG.  Note, for BIM360 hosted files, this conversion process is automatically triggered when a file changes.

## Part 2 - Viewing

1. in your `/etc/HOSTS` file, add `127.0.0.1 b360.autodesk.com`
> you'll need this to bypass the Autodesk white-list

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
6. the OTG version should now load.  You can check by looking for a few websocket connections, in chrome network debug console.

> That's it ! 



# Further Reading

Autodesk University 2018: [Creating Offline Workflows with ForgeViewer](https://www.autodesk.com/autodesk-university/class/Creating-Flexible-Offline-Workflows-Using-Autodesk-Forge-2018)

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

