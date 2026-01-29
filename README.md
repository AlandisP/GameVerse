# GameVerse

GameVerse is a social media app in which provides services such as posting to a feed, party finding, groups, and messaging. The main
goal of this app is to allow people to connect and interact with each other in multiple different ways.

[Description](https://github.com/SCCapstone/CodeCartel/wiki/Project-Description)

[Architecture](https://github.com/SCCapstone/CodeCartel/wiki/Architecture)

## External Requirements

In order to build this project you first have to install:

-   [Node.js](https://nodejs.org/en/)
-   [MongoDB](https://www.mongodb.com/)
-   [React](https://react.dev/learn/installation)
-   [Java 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
-   [Maven](https://maven.apache.org/download.cgi)

If you're downloading/cloning the repo, you don't need to install react, springboot, or maven. You need to just have the extentions in VSCode.
If you don't have react installed run: npx create-react-app my-app
If you dont have firebase installed run: npm install firebase  
## Setup

1. Connect your MongoDB to the program.
Steps:
  - Install MongoDB Compass for Local databases
  - Open the application and press "connect"
  - name the database whatever you want to, just make sure its connected to your local host(27017)
  - Now you have your own local database for our application.
2. Configure your applications properties
  - Ensure the ports are correct and the name of the database.
**There will be more instructions as development continues such has JWT token and ways to connect to the MongoDB Atlas once its set up and deployed later.** 

## Running
1. Start the springboot application backend. Run: mvn spring-boot:run
2. change your directory the the frontend. Run: cd ./frontend/
3. Run the react application. Run: npm start
4. Verify that everything is running by vieiwng you localhost tab that opened when you ran the application.

# Deployment
GameVerse is deployed using Railway, MongoDB Compass, and MongoDB Atlas.

1. Set up database in MongoDB Atlas and get connection string

2. Connect to Atlas using MongoDB Compass to manage your database

3. Deploy backend: Go to Railway → Deploy from GitHub → Add environment variables (MongoDB Atlas connection string)

4. Deploy frontend: Create new Railway project → Set root to frontend → Add environment variables

Railway redeploys automatically on push to GitHub.

# Testing

The unit tests are in `/GameVerse/test/java/com/GameVerse/GameVerse`.

The behavioral tests are in `/GameVerse/test/java/com/GameVerse/GameVerse/selenium`.

## Testing Technology

Testing frameworks are included with Maven and React. No additional installation needed.

## Running Tests

1. Run the backend + frontend(npm start) of the application
2. Make sure you're in the GameVerse/ directory(otherwise next command will not work)
3. run the command 'mvnw test' in the termainl and the tests will run.

**If you're using VScode, you can run tests via the testing tab or you can run them manually by going into the test folder and running each test.


# Authors

Alandis Patterson(alandisp@email.sc.edu)
Gage Hulbert(hulbertg@email.sc.edu)
Joshua Cook(jc157@email.sc.edu)
Quintarius Floyd(qfloyd@email.sc.edu)
Jamius Cheatham(jamius@sc.edu)
