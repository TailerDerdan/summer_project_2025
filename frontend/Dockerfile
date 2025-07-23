FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY . /usr/share/nginx/html

EXPOSE 82
CMD ["nginx", "-g", "daemon off;"]