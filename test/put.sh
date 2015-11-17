#!/bin/bash

COOKIE=qa_session_id=32da49ee4fd3044ea9caa2acf03b2785

TESTHOST=http://localhost:19001
BASE=$TESTHOST/dictionaries/api/v1.0/users/current/dictionaries
PRETTY=cat
if ( which prettydiff.sh ) ; then
    PRETTY=prettydiff.sh
fi

OUT=get.out

echo " "
echo "PUT ========================================="
N=TEST_DICTIONARY
Q="$BASE/$N.json"
echo PUT $N $Q
curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -d '{"name": "GOTCHA", "payload": true, "enabled": false, "cuteness": 42}' -X PUT "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
echo "GET ========================================="
N=TEST_DICTIONARY
Q="$BASE/$N.json"
echo GET $N $Q
curl -H "Cookie: $COOKIE;" "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
echo "DELETE ========================================="
N=TEST_DICTIONARY
Q="$BASE/$N.json"
echo DELETE $N $Q
curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -X DELETE "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

rm get.out
