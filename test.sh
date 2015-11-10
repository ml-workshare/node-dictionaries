COOKIE=qa_session_id=e8e19423e9431b691e24841d70c3786c

Q='/dictionaries/api/v1.0/users/current/dictionaries/XXXXX.json'
echo PUT $Q
curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -d '{"key":{"value": [1,2,3]}}' -X PUT "https://qa.workshare.com/$Q" > get.json 2> /dev/null
#curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -d '{"key":"value"}' -X PUT "https://qa.workshare.com/$Q" > get.json 2> /dev/null
prettydiff.sh get.json

echo GET $Q
curl -H "Cookie: $COOKIE;" "https://qa.workshare.com/$Q" > get.json 2> /dev/null
prettydiff.sh get.json

Q='/dictionaries/api/v1.0/users/current/dictionaries.json'
echo GET $Q
curl -H "Cookie: $COOKIE;" "https://qa.workshare.com/$Q" > get.json 2> /dev/null
prettydiff.sh get.json

Q='/dictionaries/api/v1.0/users/current/dictionaries.json?filters%5Bvisited%5D=true'
echo GET $Q
curl -H "Cookie: $COOKIE;" "https://qa.workshare.com/$Q" > get.json 2> /dev/null
prettydiff.sh get.json

Q='/dictionaries/api/v1.0/users/current/dictionaries/NOTFOUND.json'
echo GET $Q
curl -H "Cookie: $COOKIE;" "https://qa.workshare.com/$Q" > get.json 2> /dev/null
prettydiff.sh get.json

Q='/dictionaries/api/v1.0/users/current/dictionaries/XXXXX.json'
echo DELETE $Q
curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -X DELETE "https://qa.workshare.com/$Q" > get.json 2> /dev/null
prettydiff.sh get.json

echo GET $Q
curl -H "Cookie: $COOKIE;" "https://qa.workshare.com/$Q" > get.json 2> /dev/null
prettydiff.sh get.json
