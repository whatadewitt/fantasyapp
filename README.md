Yahoo! Fantasy Value Calculator
==========

This is a simple fantasy baseball application I wrote that will query the Yahoo! Fantasy Sports API to automatically calculate the team values in your league.

I wrote this as a quick way of managing my own fantasy league's salary cap, but there was some interest in it so I have put it here on GitHub for anyone interested to enjoy.

The application works by reading your league's ID entered in a configuration file and will check your league transactions and cache the most recent transaction number. If the last transaction number does not match up with the cached number, the league rosters will be pulled and compared against the league draft cache to calculate team values.

The code was put together pretty quickly, and I do plan on making improvements, but in the meantime it serves its purpose.

The application is built using NodeJS and a Mongo Database. I wrote the application as a learning experiment to learn both the Yahoo! Fantasy API and MongoDB.

Requirements
--------------

- NodeJS
- Mongo
- Yahoo! Fantasy Application Key and Secret

Installation
--------------

```sh
git clone [git-repo-url] fantasyapp
cd fantasyapp
npm install
```

#### Create a Yahoo! Fantasy Application

- Visit https://developer.apps.yahoo.com/projects
- Sign in with your Yahoo! account
- Create a new project
    - Web-based app
    - This app will only access public APIs, Web Services, or RSS feeds.
    - Yahoo! BOSS is not required for this project
- Once your app is created, select the "Fantasy Sports - Read" Permission from the Project Details page

#### Configure Application in conf/conf.json

- Update APP_KEY with the Consumer Key on your Yahoo! Project Details page
- Update APP_SECRET with the Consumer Secret on your Yahoo! Project Details page
- Update LEAGUE_ID with your league ID. Your league ID can be found by visiting your league page (http://baseball.fantasysports.yahoo.com/b1/[YOUR LEAGUE ID])
    - The "328.l." prefix indicates MLB 2014 in the Yahoo! Fantasy Sports API
- Update the cost of a free agent by updating the FREE_AGENT_COST

#### Populate league teams and draft

In a "not the most ideal way" to do things, you'll first want to navigate to /getleagueteams to pull down the teams in the league.

Next, navigate to /pluckdraft to pull down and cache the league draft results.

Finally, you can visit / to pull down the team rosters and calculate and display team values.

Deployment
--------------

I deployed this app to Heroku pretty easily. It was the first app I've really deployed to Heroku. I added a MongoHQ instance, as well as with New Relic at a cost of $0.


License
----

GPLv2


[luke dewitt]:http://whatadewitt.ca/
[@whatadewitt]:http://twitter.com/whatadewitt
[node.js]:http://nodejs.org
[Twitter Bootstrap]:http://getbootstrap.com/
[MongoDB]:http://www.mongodb.com/
[mongoose]:http://mongoosejs.com/
[express]:http://expressjs.com