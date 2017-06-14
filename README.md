### chilipeppr.local
Solution for an offline chilipeppr that can run local on your machine (Windows/Linux)

I want to start to build an chilipeppr widget, but after some time i was frustrated. First of all i have to search in a lot of github repositorys for the correct code pieces, that i needed to devlop a cp widget. On the other hand, my dev machine must have a internet connection, to run chilipeppr.

Now i found a better solution and use the feature "submodule" from git. Here the [description](https://git-scm.com/book/en/v2/Git-Tools-Submodules):
> It often happens that while working on one project, you need to use another project from within it. Perhaps it’s a library that a third party developed or that you’re developing separately and using in multiple parent projects. A common issue arises in these scenarios: you want to be able to treat the two projects as separate yet still be able to use one from within the other.
> ...
> Git addresses this issue using submodules. Submodules allow you to keep a Git repository as a subdirectory of another Git repository. This lets you clone another repository into your project and keep your commits separate.

I did the same and link all the exists widgets from around the world in the widgets directory also i download the specific cp js files from John his server and save them in this repository "jslibs/cplibs".

The big librarys, and this make a checkout so big (~1GB), named jquery, bootsrap or threejs are also linked in this repository.

Please check the Installation guide's to know how you can install this local on your machine or if you want also on an root server. It's your choice:

### pros
* you can use chilieppr offline
* you can install chilipeppr on a external linux machine
* you can install chilipeppr to your root server or raspberry pi
* you need as additional Software just a webserver and a browser
* use grep on your machine to find external cp code to develop your own widget
* just call ````git submodule update --recursive```` and all modules are refreshed to the latest version
* possible to local test your brandnew alpha widget
* 

### cons
* you have to update your installation from time to time
* i don't know :)

## Windows installation
* install [mongoose](https://www.cesanta.com/products/binary) and [git-bash](https://git-for-windows.github.io/) for windows
* start git-bash: ````git clone --recursive https://github.com/xpix/chilipeppr.local````
* start mongoose and set this to the root git directory
* surf to http://127.0.0.1:8080/chilipeppr.local/workspace_tinyg.html

## sync fork
* https://help.github.com/articles/configuring-a-remote-for-a-fork/
* https://help.github.com/articles/syncing-a-fork/

## use my forked widget to make some changes
* first [fork](https://help.github.com/articles/fork-a-repo/) the original widget from https://github.com/chilipeppr/widget-*
* make a git submodule via git and mark this widget as your own:
````
cd chilipeppr.local/widgets/
git submodule add https://github.com/xpix/widget-tinyg.git xpix-widget-tinyg
cd xpix-widget-tinyg
````
* create a branch for your local changes ````git checkout -b my_new_feature_branch````
* change the url in your workspace
````
// TinyG
chilipeppr.load(
    "com-chilipeppr-tinyg",
    // "widgets/widget-tinyg/auto-generated-widget.html",
    "widgets/xpix-widget-tinyg/auto-generated-widget.html",
...
````
* make ur changes
* commit and push this changes (git commit -am "message" && git push)
* send this branch as pullrequest to the original autor
* he will check ur changes and maybe merge this with the original widget



