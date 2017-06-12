### chilipeppr.local
Solution for an offline chilipeppr that can run local on your machine (Windows/Linux)

## Windows installation
* install [mongoose](https://www.cesanta.com/products/binary) and [git-bash](https://git-for-windows.github.io/) for windows
* start git-bash:
````
git clone --recursive https://github.com/xpix/chilipeppr.local
````
* start mongoose and set this to the root git directory
* surf to http://127.0.0.1:8080/chilipeppr.local/workspace_tinyg.html

## sync fork
* https://help.github.com/articles/configuring-a-remote-for-a-fork/
* https://help.github.com/articles/syncing-a-fork/

## use my forked widget to make some changes
* first fork the original widget from https://github.com/chilipeppr/widget-*: 
  https://help.github.com/articles/fork-a-repo/
* make a git submodule via git and mark this widget as your own:
````
cd chilipeppr.local/widgets/
git submodule add https://github.com/xpix/widget-tinyg.git xpix-widget-tinyg
cd xpix-widget-tinyg
````
* create a branch for ur local changes git checkout -b my_new_feature_branch
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



