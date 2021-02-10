create database tatu
CREATE USER 'tatu' IDENTIFIED BY 'kururu'
CREATE USER 'oka' IDENTIFIED BY 'kururu'
create database oka
GRANT USAGE ON *.* TO 'tatu'@localhost IDENTIFIED BY 'kururu'
GRANT USAGE ON *.* TO 'oka'@localhost IDENTIFIED BY 'kururu'
GRANT ALL privileges ON `tatu`.* TO 'tatu'@localhost
GRANT ALL privileges ON `oka`.* TO 'oka'@localhost
