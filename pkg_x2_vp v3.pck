create or replace package pkg_x2_vp is

  -- Author  : EVERTON.ADM
  -- Created : 03/10/2020 10:14:50
  -- Purpose : 
  
  procedure aprovar_solicitacao (
    p_id_empresa integer, p_id_venda_perdida integer, p_usuario varchar2, p_comentario varchar2
  );
  procedure cancelar_solicitacao (
    p_id_empresa integer, p_id_venda_perdida integer, p_usuario varchar2, p_comentario varchar2
  );
  procedure concluir_solicitacao (
    p_id_empresa integer, p_id_venda_perdida integer, p_usuario varchar2, p_comentario varchar2
  );

end pkg_x2_vp;
/
create or replace package body pkg_x2_vp is

  procedure inserir_comentario (
    p_id_empresa integer, p_id_venda_perdida integer, p_id_status integer, p_data date, p_usuario varchar2, p_comentario varchar2   
  ) as 
  
    v_id_comentario integer := 0;
  
  begin 
    
    -- Registra o comentário
    select nvl(max(id_comentario),0) 
      into v_id_comentario
      from x2_vp_comentario;
    
    insert into x2_vp_comentario (id_comentario, id_empresa, id_venda_perdida, id_status, data, usuario, comentario) 
         values (v_id_comentario+1, p_id_empresa, p_id_venda_perdida, p_id_status, p_data, p_usuario, p_comentario);
      
  end inserir_comentario;

  procedure gerar_solicitacao (
    p_id_empresa integer, p_id_venda_perdida integer
  ) as
    
    v_total_solicitacao integer := 0;
    r_ve_venda_perdida ms.ve_venda_perdida%rowtype;
    v_id_status integer := 1; -- Pendente 
    
  begin
    
    select count(*) 
      into v_total_solicitacao
      from x2_vp_solicitacao 
     where id_empresa = p_id_empresa 
       and id_venda_perdida = p_id_venda_perdida;
    
    -- Se não tem registro da venda perdida
    if v_total_solicitacao = 0 then
      
      -- Recupera a venda perdida
      select * 
        into r_ve_venda_perdida
        from ms.ve_venda_perdida
       where id_empresa = p_id_empresa
         and id_venda_perdida = p_id_venda_perdida;
    
      -- Insere a solicitacao
      insert into x2_vp_solicitacao (id_empresa, id_venda_perdida, id_status) 
           values (p_id_empresa, p_id_venda_perdida, v_id_status);
      
      -- Insere o comentário do vendedor     
      inserir_comentario (p_id_empresa, p_id_venda_perdida, v_id_status, r_ve_venda_perdida.data_created, r_ve_venda_perdida.usuario_created, r_ve_venda_perdida.observacao);
      
    end if;
  
  end gerar_solicitacao;

  procedure aprovar_solicitacao (
    p_id_empresa integer, p_id_venda_perdida integer, p_usuario varchar2, p_comentario varchar2
  ) as
  
    -- Status de aprovado
    v_id_status integer := 2; 
    r_vp_solicitacao pricing.x2_vp_solicitacao%rowtype;
    
  begin
  
    gerar_solicitacao(p_id_empresa, p_id_venda_perdida);
    
    -- Recupera o registro de solicitacao
    select * 
      into r_vp_solicitacao
      from x2_vp_solicitacao 
     where id_empresa = p_id_empresa
       and id_venda_perdida = p_id_venda_perdida;
      
    -- Se o status atual for pendente
    if r_vp_solicitacao.id_status = 1 then
      
      -- Insere o comentário do aprovador     
      inserir_comentario (p_id_empresa, p_id_venda_perdida, v_id_status, sysdate, p_usuario, p_comentario);
        
      -- altera o status  
      update x2_vp_solicitacao 
         set id_status = v_id_status
       where id_empresa = p_id_empresa
         and id_venda_perdida = p_id_venda_perdida; 
           
    end if;
  
  end aprovar_solicitacao;
  
  procedure concluir_solicitacao (
    p_id_empresa integer, p_id_venda_perdida integer, p_usuario varchar2, p_comentario varchar2
  ) as
  
    -- Status de conclusão
    v_id_status integer := 3; 
    r_vp_solicitacao pricing.x2_vp_solicitacao%rowtype;
  
  begin
    
    gerar_solicitacao(p_id_empresa, p_id_venda_perdida);
    
    -- Recupera o registro de solicitacao
    select * 
      into r_vp_solicitacao
      from x2_vp_solicitacao 
     where id_empresa = p_id_empresa
       and id_venda_perdida = p_id_venda_perdida;
      
    -- Se o status atual for pendente
    if r_vp_solicitacao.id_status = 2 then
      
      -- Insere o comentário do conclusão     
      inserir_comentario (p_id_empresa, p_id_venda_perdida, v_id_status, sysdate, p_usuario, p_comentario);
        
      -- altera o status  
      update x2_vp_solicitacao 
         set id_status = v_id_status
       where id_empresa = p_id_empresa
         and id_venda_perdida = p_id_venda_perdida; 
           
    end if;
    
  end concluir_solicitacao;
  
  procedure cancelar_solicitacao (
    p_id_empresa integer, p_id_venda_perdida integer, p_usuario varchar2, p_comentario varchar2
  ) as
  
    -- Status de cancelado
    v_id_status integer := 4; 
    
    r_vp_solicitacao pricing.x2_vp_solicitacao%rowtype;
    
    v_id_comentario integer := 0;
  
  begin
    
    gerar_solicitacao(p_id_empresa, p_id_venda_perdida);
    
    -- Recupera o registro de solicitacao
    select * 
      into r_vp_solicitacao
      from x2_vp_solicitacao 
     where id_empresa = p_id_empresa
       and id_venda_perdida = p_id_venda_perdida;
      
    -- Se o status atual for pendente
    if r_vp_solicitacao.id_status = 1 then
      
      -- Registra o comentário
      select nvl(max(id_comentario),0) 
        into v_id_comentario
        from x2_vp_comentario;
      
      insert into x2_vp_comentario (id_comentario, id_empresa, id_venda_perdida, id_status, data, usuario, comentario) 
      values (v_id_comentario+1, p_id_empresa, p_id_venda_perdida, v_id_status, sysdate, p_usuario, p_comentario);
        
      -- altera o status  
      update x2_vp_solicitacao 
         set id_status = v_id_status
       where id_empresa = p_id_empresa
         and id_venda_perdida = p_id_venda_perdida; 
           
    end if;
  
  end cancelar_solicitacao;

end pkg_x2_vp;
/
