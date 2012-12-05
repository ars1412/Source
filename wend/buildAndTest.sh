:

git push heroku master
url=`heroku open | cut -f2- "-d "`
echo "$url"

java -jar test/selenium-server-standalone-2.22.0.jar -htmlSuite *firefox "$url" "/Users/samson/.jenkins/jobs/herokuclient/workspace/test/web_suite.html" "/Users/samson/.jenkins/jobs/herokuclient/workspace/test-result/results.html"
