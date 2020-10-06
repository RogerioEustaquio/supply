prompt PL/SQL Developer import file
prompt Created on sábado, 3 de outubro de 2020 by everton.adm
set feedback off
set define off
prompt Creating X2_VP_STATUS...
create table X2_VP_STATUS
(
  id_status INTEGER not null,
  descricao VARCHAR2(50)
)
tablespace DADOS
  pctfree 10
  initrans 1
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );
alter table X2_VP_STATUS
  add constraint PK_X2_VP_STATUS primary key (ID_STATUS)
  using index 
  tablespace DADOS
  pctfree 10
  initrans 2
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );

prompt Creating X2_VP_SOLICITACAO...
create table X2_VP_SOLICITACAO
(
  id_empresa       INTEGER not null,
  id_venda_perdida INTEGER not null,
  id_status        INTEGER
)
tablespace DADOS
  pctfree 10
  initrans 1
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );
alter table X2_VP_SOLICITACAO
  add constraint PK_X2_VP_SOLICITACAO primary key (ID_EMPRESA, ID_VENDA_PERDIDA)
  using index 
  tablespace DADOS
  pctfree 10
  initrans 2
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );
alter table X2_VP_SOLICITACAO
  add constraint FK_X2_VP_SOLICTACAO_STATUS foreign key (ID_STATUS)
  references X2_VP_STATUS (ID_STATUS);

prompt Creating X2_VP_COMENTARIO...
create table X2_VP_COMENTARIO
(
  id_comentario    INTEGER not null,
  id_empresa       INTEGER,
  id_venda_perdida INTEGER,
  id_status        INTEGER,
  data             DATE,
  usuario          VARCHAR2(40),
  comentario       VARCHAR2(100)
)
tablespace DADOS
  pctfree 10
  initrans 1
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );
alter table X2_VP_COMENTARIO
  add constraint PK_X2_VP_COMENTARIO primary key (ID_COMENTARIO)
  using index 
  tablespace DADOS
  pctfree 10
  initrans 2
  maxtrans 255
  storage
  (
    initial 64K
    next 1M
    minextents 1
    maxextents unlimited
  );
alter table X2_VP_COMENTARIO
  add constraint FK_X2_VP_SOLICITACAO foreign key (ID_EMPRESA, ID_VENDA_PERDIDA)
  references X2_VP_SOLICITACAO (ID_EMPRESA, ID_VENDA_PERDIDA);

prompt Disabling triggers for X2_VP_STATUS...
alter table X2_VP_STATUS disable all triggers;
prompt Disabling triggers for X2_VP_SOLICITACAO...
alter table X2_VP_SOLICITACAO disable all triggers;
prompt Disabling triggers for X2_VP_COMENTARIO...
alter table X2_VP_COMENTARIO disable all triggers;
prompt Disabling foreign key constraints for X2_VP_SOLICITACAO...
alter table X2_VP_SOLICITACAO disable constraint FK_X2_VP_SOLICTACAO_STATUS;
prompt Disabling foreign key constraints for X2_VP_COMENTARIO...
alter table X2_VP_COMENTARIO disable constraint FK_X2_VP_SOLICITACAO;
prompt Deleting X2_VP_COMENTARIO...
delete from X2_VP_COMENTARIO;
commit;
prompt Deleting X2_VP_SOLICITACAO...
delete from X2_VP_SOLICITACAO;
commit;
prompt Deleting X2_VP_STATUS...
delete from X2_VP_STATUS;
commit;
prompt Loading X2_VP_STATUS...
insert into X2_VP_STATUS (id_status, descricao)
values (1, 'Pendente');
insert into X2_VP_STATUS (id_status, descricao)
values (2, 'Aprovado');
insert into X2_VP_STATUS (id_status, descricao)
values (3, 'Concluído');
insert into X2_VP_STATUS (id_status, descricao)
values (4, 'Cancelado');
commit;
prompt 4 records loaded
prompt Loading X2_VP_SOLICITACAO...
insert into X2_VP_SOLICITACAO (id_empresa, id_venda_perdida, id_status)
values (8, 418622, 4);
commit;
prompt 1 records loaded
prompt Loading X2_VP_COMENTARIO...
insert into X2_VP_COMENTARIO (id_comentario, id_empresa, id_venda_perdida, id_status, data, usuario, comentario)
values (1, 8, 418622, 1, to_date('03-10-2020 10:54:46', 'dd-mm-yyyy hh24:mi:ss'), 'JEKSONBA', 'ok');
insert into X2_VP_COMENTARIO (id_comentario, id_empresa, id_venda_perdida, id_status, data, usuario, comentario)
values (2, 8, 418622, 4, to_date('03-10-2020 10:54:46', 'dd-mm-yyyy hh24:mi:ss'), 'EVERTON', 'O produto tem estoque suficiente');
commit;
prompt 2 records loaded
prompt Enabling foreign key constraints for X2_VP_SOLICITACAO...
alter table X2_VP_SOLICITACAO enable constraint FK_X2_VP_SOLICTACAO_STATUS;
prompt Enabling foreign key constraints for X2_VP_COMENTARIO...
alter table X2_VP_COMENTARIO enable constraint FK_X2_VP_SOLICITACAO;
prompt Enabling triggers for X2_VP_STATUS...
alter table X2_VP_STATUS enable all triggers;
prompt Enabling triggers for X2_VP_SOLICITACAO...
alter table X2_VP_SOLICITACAO enable all triggers;
prompt Enabling triggers for X2_VP_COMENTARIO...
alter table X2_VP_COMENTARIO enable all triggers;
set feedback on
set define on
prompt Done.
