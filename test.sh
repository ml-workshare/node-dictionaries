COOKIE=qa_session_id=f86ae43bb99a205f5ff08ce26dced54f

BASE=https://qa.workshare.com/dictionaries/api/v1.0/users/current/dictionaries
PRETTY=cat
PRETTY=prettydiff.sh
OUT=get.out

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
N=TEST_DELETE
Q="$BASE/$N.json"
echo PUT $N $Q
curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -d '{"name": "GOTCHA", "payload": true, "enabled": false, "cuteness": 42}' -X PUT "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
echo "DELETE ========================================="
Q="$BASE/$N.json"
echo DELETE $N $Q
curl -H "Cookie: $COOKIE;" -H 'Content-Type: application/json' -X DELETE "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
echo "GET ========================================="
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
echo "GET ALL ===================================="
Q="$BASE.json"
echo GET $Q
curl -H "Cookie: $COOKIE;" "$Q" > $OUT 2> /dev/null
$PRETTY $OUT

echo " "
echo "GET FILTER ================================="
Q="$BASE.json?filters%5Bpayload%5D=true&filters%5Benabled%5D=true"
echo GET $Q
curl -H "Cookie: $COOKIE;" "$Q" > $OUT 2> /dev/null
$PRETTY $OUT
