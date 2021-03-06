#!/bin/bash
# ./test.sh | tee results.log

# specs for the service
# https://github.com/jesuspc/node_club-dictionaries/blob/master/README.md

COOKIE=qa_session_id=32da49ee4fd3044ea9caa2acf03b2785

TESTHOST=https://qa.workshare.com
TESTHOST=http://localhost:19001
BASE=$TESTHOST/dictionaries/api/v1.0/users/current/dictionaries
PRETTY=cat
if ( which prettydiff.sh > /dev/null ) ; then
    PRETTY=prettydiff.sh
fi
OUT=get.out

echo " "
echo "SWAGGER ======================================"
Q="$TESTHOST/dictionaries/swagger-ui/index.html"
echo GET $Q

echo " "
echo "HEALTH ======================================="
Q="$TESTHOST/dictionaries/admin/healthcheck"
echo GET $Q
curl -H "Cookie: $COOKIE;" "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
echo "VERSION ======================================"
Q="$TESTHOST/dictionaries/admin/version"
echo GET $Q
curl -H "Cookie: $COOKIE;" "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
echo "RESET ======================================="

for N in TEST_DICTIONARY TEST_OTHER TEST_NONOBJECT TEST_ARRAY TEST_DELETE GOTCHA GOTCHA GOTCHA GOTCHA
do
    Q="$BASE/$N.json"
    echo DELETE $N
    curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -X DELETE "$Q" > /dev/null 2> /dev/null
    curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -X DELETE "$Q" 2> /dev/null
    echo " "
done

echo " "
echo "DENIED ======================================"
Q="$BASE/$N.json"
echo GET $N $Q
curl -H "Cookie: qa_session=plugh;" "$Q" > $OUT 2> /dev/null
$PRETTY $OUT


echo " "
echo "PUT ========================================="
N=TEST_DICTIONARY
Q="$BASE/$N.json"
echo PUT $N $Q
curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -d '{"name": "GOTCHA", "payload": true, "enabled": false, "cuteness": 42}' -X PUT "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
N=TEST_OTHER
Q="$BASE/$N.json"
echo PUT $N $Q
curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -d '{"type": "weirdulator", "enabled": true, "cuteness": -12, "added": "this"}' -X PUT "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
N=TEST_OTHER
Q="$BASE/$N.json"
echo PUT $N $Q
curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -d '{"type": "weird", "payload": true, "enabled": true, "cuteness": -12}' -X PUT "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
N=TEST_NONOBJECT
Q="$BASE/$N.json"
echo PUT $N $Q
curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -d 'the thing is not an object' -X PUT "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
N=TEST_ARRAY
Q="$BASE/$N.json"
echo PUT $N $Q
curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -d '[{"name": "GOTCHA", "payload": true, "enabled": false, "cuteness": 42}]' -X PUT "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
N=TEST_DELETE
Q="$BASE/$N.json"
echo PUT $N $Q
curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -d '{"name": "GOTCHA", "payload": true, "enabled": false, "cuteness": 42}' -X PUT "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
echo "DELETE ========================================="
N=TEST_DELETE
Q="$BASE/$N.json"
echo DELETE $N $Q
curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -X DELETE "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
echo "GET ========================================="
N=TEST_DELETE
Q="$BASE/$N.json"
echo GET $N $Q
curl -H "Cookie: $COOKIE;" "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
N=TEST_DICTIONARY
Q="$BASE/$N.json"
echo GET $N $Q
curl -H "Cookie: $COOKIE;" "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
N=TEST_OTHER
Q="$BASE/$N.json"
echo GET $N $Q
curl -H "Cookie: $COOKIE;" "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
N=GOTCHA
Q="$BASE/$N.json"
echo GET $N $Q
curl -H "Cookie: $COOKIE;" "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
echo "GET ALL ===================================="
Q="$BASE.json"
echo GET $Q
curl -H "Cookie: $COOKIE;" "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
echo "GET FILTER ================================="
Q="$BASE.json?filters%5Bpayload%5D=true"
echo GET $Q
curl -H "Cookie: $COOKIE;" "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
Q="$BASE.json?filters%5Bpayload%5D=true&filters%5Benabled%5D=true"
echo GET $Q
curl -H "Cookie: $COOKIE;" "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
echo "DELETE ========================================="
N=TEST_OTHER
Q="$BASE/$N.json"
echo DELETE $N $Q
curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -X DELETE "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

rm get.out
