create database chat;
create table messages(
    id serial primary key,
    room_name varchar(100),
    sender_name varchar(100),
    content text
    is_update boolean default false

);