#!/usr/bin/env bash
#set -e # do not use this

for i in 1 2 3 4 5 6; do
  echo 'Waiting for minio'
  curl -f http://minio:9000/minio/health/live
  ret=$?
  echo "Return code was $ret"
  [ $ret -eq 0 ] && break
  sleep 5
done

/usr/bin/mc alias set local http://minio:9000 minioadmin minioadmin;
/usr/bin/mc mb --ignore-existing local/minigplus;
/usr/bin/mc admin user add local stsadmin stsadmin-secret;
/usr/bin/mc admin policy add local rwall /root/dev-rwall-role-policy.json;
/usr/bin/mc admin policy set local rwall user=stsadmin;
/usr/bin/mc policy set-json /root/dev-public-read-bucket-policy.json local/minigplus;
