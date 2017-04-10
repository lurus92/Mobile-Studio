# Mobile Studio
Mobile Studio is a simple, cross-platform NativeScript IDE able to develop native applications for iOS and Android.
![alt tag](https://github.com/lurus92/Mobile-Studio/blob/master/MobileStudio.png)


## Libraries and Technology Used:
* Electron (to convert a JS app to a native desktop one)
* NativeScript (to convert a simil-JS code to native Android/iOS)
* jQuery Mobile (utility)
* jQueryUI / Bootstrap (Front-End)
* Node.js (Back-End)

## Prerequisites
These components should be installed in order to let the software run:
* Node.js https://nodejs.org/en/
* NativeScript https://www.nativescript.org
* Android SDK / Xcode (depending if you want to build Android/iOS apps)

No checks are performed by the app. An automated installer is currently under development.

## Execution
Simply download the executable files in the bin folder and run it.

## Note for Android
It can happen that Android SDK path is not correctly recognized and thus is not possible to build apps for that platform. If Android SDK has been correctly installed, the solution is simple. Just open a terminal and write the following lines

    export ANDROID_HOME=/Users/$(whoami)/Library/Android/sdk
    export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
