envsubst '$SERVER_URL' </etc/nginx/conf.d/default.conf.temp | envsubst '$AI_SERVICE_URL' | envsubst '$AUTH_URL' >/etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'