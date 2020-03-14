---
title: mySql
date: 2020-02-29 16:27:36
tags:
---

```SQL
-- 打开mysql
-- mysql -uroot -p;  

-- 退出
exit;

-- 查看所有数据库
show databases;

-- 新建数据库
create database db1;
-- 新建数据库 指定字符集
create database db2 character set utf8;

-- 查看数据库详情
show create database db1;

-- 删除数据库
drop database db2;

-- 使用指定数据库
use db1;

-- 创建表
create table person(name varchar(10), age int);

-- 查看所有表
show tables;

-- 查看表详情
show create table person;

-- 表引擎
-- 1.innoDB(默认) 支持事务和外链等高级操作
-- 2.myisam: 只支持基础的增删改查操作

-- 创建表指定引擎、字符集
create table t1(name varchar(10), age int)engine=myisam charset=gbk;

-- 查看表字段
desc t1;

-- 修改表名
rename table t1 to t2;

-- 修改引擎和字符集
alter table t2 engine=innodb charset=utf8;

-- 添加表字段
alter table t2 add gender int;
alter table t2 add idCard varchar(18) first;
alter table t2 add addres varchar(50) after name;

-- 删除表字段
alter table t2 drop gender;

-- 修改表字段和类型
alter table t2 change idCard id int;

-- 修改字段类型和位置
alter table t2 modify gender int after name;

-- 删除表
drop table t2;

-- 插入数据
-- 全表插入
insert into t2 values(值1, 值2, 值3);
-- 指定字段插入
insert into t2(name, age) values('Tom', 18);

-- 中文问题
set names gbk;

-- 批量插入
insert into t2 values(a, b, c), (d, e, f);
insert into tw(name) values('张三'), ('李四'), ('老王');

-- 查询数据
select name from t2;
select name,age from t2 where age<0;
select * from t2;

-- 修改数据
update t2 set name='隔壁' where name='老王';
update t2 set age=100 where id=1;

-- 删除数据
delete from t2 where age<20;
delete from t2 where name is null;
delete from t2;

-- 主键 唯一且非空
create table t1(id int primary key, name varchar(10));
-- 主键自增 只增不减  从历史最大值 +1
create table t2(id int primary key auto_increment);

-- 添加注释
create table t3(`id` int primary key auto_increment comment 'this is key', `name` varchar(10) comment 'this is user name');

-- 事务：数据库中执行同意业务多条SQL语句的工作单元，可以保证多头SQL全部执行成功或全部执行失败
begin;
update t3 set name='lll' where name='a' and id=1;
update t3 set name='lll2' where name='b' and id=1;
-- 回滚到开始时
rollback;

begin;
update t3 set name='lll' where name='a' and id=1;
update t3 set name='lll2' where name='b' and id=1;
-- 提交事务
commit;

begin;
update t3 set name='lll' where name='a' and id=1;
savepoint s1;
update t3 set name='lll2' where name='b' and id=1;
savepoint s2;
-- 回滚到指定回滚点
rollback to s1;

-- 事务的四大特性 ACID特性
-- Atomicity 原子性：最小不可拆分 保证全部执行成功或全部执行失败
-- Consistency 一致性：从一个一致状态到另一个一致状态。
-- Isolation 隔离性：多个事务之间互相隔离互不影响。
-- Durability 持久性： 当事务提交后数据保存到磁盘中持久生效.


-- 删除表并创建新表
truncate table t2;

-- SQL分类
-- DDL 数据定义语言  不支持事务
create drop alter truncate
-- DML 数据操作语言   支持事务
insert update delete select
-- DQL 数据查询语言
select
-- TCL 事务控制语言
begin commit rollback savepoint xxx   rollback xxx;
-- DCL 数据控制语言  分配用户权限相关sql


-- SQL 数据类型
m为显示长度
int(m)
bigint(m)

-- 浮点数
double(m, d)
-- 高精度
decimal(m, d)

-- 最大255 指定长度，执行效率高
char(10)
-- 可变长度  最大65535  超过255建议 text
varchar(30)
-- 可变长度 最大65535
text(655)

-- 时间
-- 年月日
date
-- 时分秒
time
-- 默认null 最大  9999-12-31
datetime
-- 默认当前系统时间， 最大2038-01-19
timestamp




-- 导入 *.sql文件
source d:/tables.sql;

-- 练习
select name,wages from emp where up is null;
select name,mgr from emp where mgr is not null;

-- 别名
select name as '姓名' from emp;
select name '姓名' from emp;
select name 姓名 from emp;

-- 比较运算符 > <  >=  <=   != <>
select name,mgr from emp where mgr<2000;
select name,mgr,job from emp where job='manager';
select name,job,mgr from emp where mgr<1600;
select name,nm from emp where nm != 10;
select name,nm from emp where nm <> 10;
select * from t_item where price=23;
select title from t_item where price <> 8443;

-- 去重 distinct
select distinct job from emp;
select distinct deptno from emp;

-- and or
select * from emp where deptno=10 and sal < 2000;
select * from emp where deptno=30 or sal > 3000;

-- 模糊查询 like
-- % 0或多个未知字符
-- _单个未知字符
select * from emp where ename like 'j%';
select ename,sal from emp where ename like '_l%';
select title from t_item where title like '%记事本%';
select ename,sal,job from emp where job like '%an%' and sal > 1500;
select * from t_item where sell_point like '%赠%' and title like '%dell%';
select title,price from t_item where title like '%笔记本%' and price<100;
select * from t_item where image is not null and title like '%得力%';
select ename from emp where ename not like '%a%';

-- between
select ename,sal from emp where sal<=3000 and sal>=2000;
select ename,sal from emp where sal between 2000 and 3000;
select title,price from t_item where price between 50 and 100;
select ename,sal from emp where sal not between 1000 and 2000;

-- in
select * from emp where sal=800 or sal=1300 or sal=1500;
select * from emp where sal in(200, 1300, 1500);
select title,price from t_item where price in(56,58,89);
select ename,sal from emp where sal not in(3000,5000,1500);

-- 练习
select * from t_item where categoryId in(238,917);
select title,price from t_item where title like '%得力%' and price between 50 and 200;
select ename,sal,deptno from emp where deptno is not null and sal<2000;
select ename,jj,mgr from emp where mgr is not null and jj>0;
select distinct job from emp where ename like '%a%' and sal<3000;

-- 排序 order by
select ename,sal from emp where sal<3000 order by sal desc;
select ename,sal from emp where deptno=10 order by sal asc;
select ename,sal,comm from emp where comm>0 order by comm desc;
select price,tile from t_item where price<100 order by price;

-- 多字段排序
select ename,saldeptno from emp where order by deptno desc,sal asc;

-- 分页查询 limit 跳过的条数,请求的条数
select ename,sal from emp order by sal desc limit 6,3;
select * from emp order by sal desc linit 0,3;
select title,price from t_item order by price asc limit 10,5;
select * from emp where deptno=30 order by sal desc limit 0,1;

-- 数值计算 + - * / %
select ename,sal,sal*5 年终奖 from emp;
select title,price,num,price*num 总价值 from t_item;
select ename,sal+5 加薪后工资 from emp;

-- 日期相关SQL
-- 获取系统时间 now()
create table t_date(name varchar(10), birthday datetime);
insert into t_date values('Tom', now());
select now();
select curdate();
select curtime();
-- 从年月日时分秒中提取日期 或 时间
select date(now());
select time(now());
select created_time from t_item;
select date(created_time) from t_time;

-- 从年月日时分秒中提取时间分量
select extract(year from now());
select extract(month from now());
select extract(day from now());
select extract(hour from now());
select extract(minute from now());
select extract(second from now());

select ename,extract(year from hiredate) from emp;

-- 日期格式化
select date_format(now(), '%Y年%m月%d日 %H点%i分%s秒');
-- 反向格式化 
select str_to_date('21.02.2020 15点23分23秒', '%d.%m.%Y %H点%i分%s秒');


-- ifnull(x, y)   null ? y : x
update emp set comm=ifnull(comm, 0);

-- 聚合函数 对查询的多条数据进行统计查询：平均值 最大值 最小值 求和 计数
-- 平均值 avg
select avg(sal) from emp;
-- 最大值 max
select max(sal) from emp where deptno=20;
-- 最小值min
select min(sal) from emp where ename like '%a%';
-- 求和 sum
select sum(sal) from emp where deptno=10;
-- 计数 count()
select count(*) from emp where sal>2000;

select avg(sal),max(sal),min(sal),sum(sal),count(*) from emp where deptno=20;

-- 字符串相关

-- 拼接 concat()
select concat('aa', 'bb');
select ename,concat(sal, '元') from emp;
-- 长度 chart_length(str)
select char_length('abc');
select ename,char_length(ename) from emp;
-- 位置 instr(str, substr)
select instr('abcdefg', 'd');
-- 大小写转换 upper() lower()
select upper('aaa');
select lower('NBA');
-- 字符串截取
select left('abcdefg', 2);
select right('abcdefg', 2);
select substring('abcdefg', 2, 3);
-- 去两端白 trim()
select trim('  adfa  ');
-- 重复 repeat()
select repeat('abc', 2);
-- 替换 replace()
select replace('absdfaslasabfajf', 'b', 'm');
-- 反转 reverse()
select reverse('abc');

-- 练习
select num,ename,sal from emp where deptno is null;
select ename,job,sal,comm from emp where comm is null or comm=0;
select num,ename,job,comm from emp where comm>0;
select ename,sal,deptno from emp where deptno is not null;
select ename from emp where ename like 's%';
select ename from emp where ename like '%e_';
select ename from emp where ename like '%n__';
select ename from emp where ename like '%a%';
select * from emp where ename not like 'k%';
select * from emp where ename not like '%a%';
select count(*) from emp where job like 'clerk';
select max(sal) from emp where job='销售';
select create_time from emp order by create_time limit 0,1;
select create_time from emp order by create_time desc limit 0,1)
select sum(num) from t_item where category_id=163;
select * from t_item where category_id=163;
select title from t_item where price<=100;
select ename,job,sal,create_time,deptno from emp where sal>3000 or deptno=30;
select * from emp where deptno<>30;
select * from emp where comm is not null;
select num,ename,job from emp order by num desc;
select ename,job,sal from emp where num=10 or num=30 order by sal asc;
select num,ename,sal,deptno where sal>1000 order by num desc,sal asc;
select sum(sal) from emp;
select min(hiredate),max(hiredate) from emp;

-- 数字相关
select floor(3.44);
select round(4.35);
select round(3.45675, 2);
select truncate(2.3543,2);
select rand();

-- 分组查询
select gender,avg(age) from emp group by gender;
select deptno,avg(sal) from emp group by deptno;
select job,max(sal) from emp group by job;
select deptno,count(*) from emp group by deptno;
select deptno,count(*) from emp where sal>1500 group by deptno;
select mgr,count(*) from emp where mgr is not null group by mgr;
select deptno,job,avg(sal) from emp group by deptno,job;
select deptno,count(*) c,sum(sal) s from emp group by deptno order by c,s desc;
select avg(sal) a,min(sal),max(sal) from emp where sal between 1000 adn 3000 group by deptno order by a;
select count(*) c,sum(sal),avg(sal) a from emp where mgr is not null group by job order by c desc,a;

-- 聚合查询条件
select deptno,avg(sal) a from emp group by deptno having a>2000;
select category_id,avg(price) a from t_item group by category_id having a<100;
select deptno,count(*),avg(sal) a from emp group by deptno having a>2000 order by a desc;
select category_id,avg(price) from t_item where category_id in(238,917) group by category_id;
select deptno,sum(sal),avg(sal) a from emp where sal between 1000 and 3000 group by deptno having a>=2000 order by a;
select extract(year, dcredate) e, count(*) from emp group by e;
select deptno,avg(sal) a from emp group by deptno order by a desc limit 0,1;

-- 子查询 嵌套查询
select * from emp where sal>(select avg(sal) from emp);
select * from emp where sal>(select max(sal) from emp);
select * from emp where sal>(select max(avg) from emp where deptno=20);
select * from emp where job=(select job from emp where ename='jones') and ename<>'joens';
select * from emp where deptno=(select deptno from emp where sal=(select min(sal) from emp)) and sal<>(select (min(sal)) from emp)
select * from emp where hiredate=(select max(hiredate) from emp);
select * from dept where deptno=(select deptno from emp where ename='king');
select * from dept where deptno in (select distinct deptno from emp) and deptno <> 40;
select * from dept where deptno in(select deptno from emp group by deptno having avg(sal)=(select avg(sal) a from emp group by deptno order by a desc limit 0,1))

-- 子查询可以放的位置
-- 1. 写在where having 后面
-- 2. 创建表的时候，吧查询结果保存到新表
create table emp_2 as (select * from emp where deptno=2);
-- 3. 写在from后面   一定要写别名
select ename from (select * from emp where deptno=10) t;

-- 关联查询 必须写关联关系   不写会得到两张表的成绩
-- 等值连接  查两张表交集数据
select e.ename, d.dname from emp e,dept d where e.deptno=d.deptno;
-- 内连接 查两张表交集数据
select e.ename,d.dname from emp e join dept d on e.deptno=d.deptno;
select e.ename,d.dname,e.sal from emp e join dept d on e.deptno=d.deptno where e.sal>2000;
select e.name,e.sal from emp e join dept d on e.deptno=d.deptno where a.dept='new york';
select e.ename,d.dname,d.loc from emp e join dept d on e.deptno=d.deptno where e.ename='james';
-- 外连接 查一张表全集，另一张表的交集
select e.ename,d.dname from emp e right join dept d on e.deptno=d.deptno;

-- 练习
select deptno,count(*) c from emp group by deptno order by c desc;
select deptno,mgr,count(*) from emp where mgr is not null group by deptno,mgr;
select job avg(sal) from emp group by job;
select extract(year, dictdate) y,count(*) from emp group by y;
select * from emp where sal=(select min(sal) from emp);
select * from dept where deptno in(select deptno c from emp group by deptno having count(*)<=3);
select d.* from emp e right join dept d group by deptno having count(e.ename)<=3;
select * from emp where ename=(select ename from emp group by mgr having count(*)=1);
select * from dept where deptno in(select deptno from emp group by deptno having sum(sal)=(select sum(sal) s from emp group by deptno group by s limit 0,1));
select * from emp where ename in(select ename from emp group by mgr having count(*)=(select count(*) c from emp group by mgr order by c desc limit 0,1));
select * from emp where ename in(select ename from emp group by deptno having deptno=(select deptno from emp order by dictdate desc limit 0,1));
select * from dept deptno in(select deptno from emp group by deptno having avg(sal)>(select avg(sal) from emp where deptno=20 group by deptno));
select e.*,d.dname from emp e left join dept d on e.deptno=d.deptno;
select e.*,d.dname,d.loc from emp e left join dept d on e.deptno=d.deptno;
select * from emp where deptno in(select deptno from dept where loc='Dallas');
select count(*) from emp e right join dept d on e.deptno=d.deptno group by d.loc;
select e.*,m.ename from emp e join emp m on e.mgr=m.empno;

```
