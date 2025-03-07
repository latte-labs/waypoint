# WayPoint Frontend

This is the frontend for the **WayPoint** project, developed with **React Native** using [`@react-native-community/cli`](https://github.com/react-native-community/cli). It serves as the user interface for interacting with the WayPoint travel planning features.

## Prerequisites

Before setting up the frontend, ensure you have the following installed on your machine:

- **Node.js** (LTS version) – Required for running React Native.
- **npm** or **yarn** – Used for managing dependencies.
- **React Native CLI** – Command-line tools for React Native development.
- **CocoaPods** (for macOS/iOS users) – Manages iOS dependencies.
- **Xcode** (for iOS development) – Required for running iOS apps.
- **Android Studio** (for Android development) – Required for running Android apps.

## First-Time Installation

Follow these steps to set up the project for the first time:

### 1. Clone the Repository

```sh
git clone https://github.com/russellhanj/W25_4495_S1_SimoneL.git
cd W25_4495_S1_SimoneL/Implementation/frontend
```

### 2. Install Dependencies

Install the required dependencies:

```sh
npm install
```

### 3. Install iOS Dependencies (Mac Users Only)

If you are running the project on **iOS**, you need to install CocoaPods dependencies:

```sh
gem install cocoapods
gem install bundler


cd ios 
bundle install  
bundle exec pod install
```

## Running the App
### iOS (Mac Users Only)

To run the app on an iOS simulator or connected device:

```sh
npx react-native run-ios
```

## Pulling and Updating After Changes

If you've already set up the project and need to update after pulling new changes:

### 1. Pull the Latest Changes

Navigate to the frontend folder and pull the latest changes:

```sh
cd W25_4495_S1_SimoneL/Implementation/frontend
git pull origin main
```

### 2. Install Updated Dependencies (If Required)

If new dependencies have been added to the project, reinstall them:

```sh
npm install
```

For iOS users, update CocoaPods dependencies as well:

```sh
cd ios
pod install
```

### 3. Run the App Again

Restart the development server and launch the app:

```sh
npx react-native start
```

Then run the app on your desired platform:

```sh
npx react-native run-android   # For Android
npx react-native run-ios       # For iOS (Mac only)
```

## Troubleshooting

If you encounter issues, check out the official [Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting) or try the following steps:

- **Clear cache and reinstall dependencies**:

  ```sh
  rm -rf node_modules && npm install
  cd ios && rm -rf Pods && bundle exec pod install && cd ..
  ````

- **Restart Metro Bundler**:

  ```sh
  npx react-native start --reset-cache
  ```

- **Check for conflicting dependencies** using:

  ```sh
  npm outdated
  ```

If issues persist, consider checking the official React Native documentation or opening an issue in the project's repository.
