<?php
namespace Api\Controller;

use Zend\View\Model\JsonModel;
use Zend\Db\ResultSet\HydratingResultSet;
use Core\Stdlib\StdClass;
use Core\Hydrator\ObjectProperty;
use Core\Hydrator\Strategy\ValueStrategy;
use Core\Mvc\Controller\AbstractRestfulController;
use Zend\Json\Json;


class VpController extends AbstractRestfulController
{
    
    /**
     * Construct
     */
    public function __construct()
    {
        
    }

    public function listarEmpresasAction()
    {
        $data = array();
        
        try {

            $session = $this->getSession();
            $usuario = $session['info'];

            $em = $this->getEntityManager();

            if($usuario['empresa'] != "EC"){

                $sql = "select id_empresa, apelido as nome
                            from ms.empresa 
                        where id_matriz = 1 
                        and apelido = '".$usuario['empresa']."'
                    ";
            }else{

                $sql = "select id_empresa, apelido as nome
                            from ms.empresa 
                        where id_matriz = 1 
                        and id_empresa = 20
                        union all
                        select * from (
                            select id_empresa, apelido as nome from ms.empresa 
                            where id_matriz = 1 
                            and id_empresa not in (26, 11, 28, 27, 20)
                            order by apelido
                        )
                ";

            }
            
            $conn = $em->getConnection();
            $stmt = $conn->prepare($sql);
            
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $stdClass = new StdClass;
            $resultSet = new HydratingResultSet($hydrator, $stdClass);
            $resultSet->initialize($results);

            $data = array();
            foreach ($resultSet as $row) {
                $data[] = $hydrator->extract($row);
            }

            $this->setCallbackData($data);
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }

    public function listaritensAction()
    {
        $data = array();

        $idEmpresa  = $this->params()->fromQuery('idEmpresa',null);
        $dataInicio = $this->params()->fromQuery('dataInicio',null);
        $dataFim    = $this->params()->fromQuery('dataFim',null);
        $idStatus   = $this->params()->fromQuery('idStatus',null);
        $idCurvaAbc = $this->params()->fromQuery('idCurvaAbc',null);
        $estoque    = $this->params()->fromQuery('estoque',null);
        $inicio     = $this->params()->fromQuery('start',null);
        $final      = $this->params()->fromQuery('limit',null);

        $andSql = '';
        $andSql2= '';

        if($idEmpresa  && $idEmpresa != 20){

            $andSql = " and a.id_empresa = $idEmpresa";
        
        }

        if($dataInicio){
            $andSql .= " AND trunc(A.DATA_CREATED) >= '$dataInicio'";
        }else{
            $andSql .= " AND trunc(A.DATA_CREATED) >= sysdate-30";
        }

        if($dataFim){
            $andSql .= " AND trunc(A.DATA_CREATED) <= '$dataFim'";
        }

        if($idStatus){
            $andSql .= " AND st.id_status = $idStatus";
        }

        if($idCurvaAbc){
            $andSql .= " AND T.ID_CURVA_ABC = '$idCurvaAbc'";
        }

        if($estoque == 'S'){
            $andSql2 .= " AND VP_ESTOQUE > 0";
        }elseif($estoque == 'N'){
            $andSql2 .= " AND VP_ESTOQUE = 0";
        }
        
        try {

            $session = $this->getSession();
            $usuario = $session['info'];

            $em = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql = "select *
                from ( SELECT A.ID_EMPRESA,
                            A.ID_VENDA_PERDIDA,
                            A.ID_ITEM,
                            A.ID_CATEGORIA,
                            A.ID_FUNCIONARIO,
                            D.APELIDO AS EMP,
                            A.ID_PESSOA AS ID_CLIENTE,
                            P.NOME AS NOME_CLIENTE,
                            B.COD_ITEM||C.DESCRICAO as cod_item,
                            B.DESCRICAO       AS DESC_ITEM,
                            G.DESCRICAO       AS MARCA,
                            s.id_curva_abc       AS CURVA,
                            A.ID_MOTIVO_VP AS ID_TIPO,
                            E.DESCRICAO AS TIPO,
                            to_char(A.DATA_CREATED, 'DD/MM/RRRR HH24:MI') VP_DATA_LANCAMENTO,
                            A.DATA_CREATED as data_order,
                            A.USUARIO_CREATED AS VP_USUARIO_LANCAMENTO,
                            H.NOME AS VP_FUNCIONARIO_VENDA,
                            A.QTDE_ITEM AS VP_QTDE,
                            A.OBSERVACAO AS VP_COMENTARIO,
                            nvl(pkg_x2_help_estoque.get_estoque_posicao_qtde(A.ID_EMPRESA, A.ID_ITEM, A.ID_CATEGORIA, A.DATA_CREATED),0) AS VP_ESTOQUE,
                            nvl(sl.id_status,1) as id_status,
                            nvl(st.descricao,'Pendente') as status
                    FROM MS.VE_VENDA_PERDIDA  A,
                            MS.PESSOA            P,
                            MS.TB_ITEM           B,
                            MS.TB_CATEGORIA      C,
                            MS.EMPRESA           D,
                            MS.VE_MOTIVO_VP      E,
                            MS.TB_ITEM_CATEGORIA F,
                            MS.TB_MARCA          G,
                            MS.FF_FUNCIONARIO    H,
                            MS.TB_ESTOQUE        S,
                            MS.TB_CURVA_ABC      T,
                            PRICING.X2_VP_SOLICITACAO SL,
                            PRICING.X2_VP_STATUS ST
                    WHERE A.ID_PESSOA = P.ID_PESSOA
                    AND A.ID_ITEM = B.ID_ITEM
                    AND A.ID_CATEGORIA = C.ID_CATEGORIA
                    AND A.ID_EMPRESA = D.ID_EMPRESA
                    AND A.ID_EMPRESA = S.ID_EMPRESA(+)
                    AND A.ID_ITEM = S.ID_ITEM(+)
                    AND A.ID_CATEGORIA = S.ID_CATEGORIA(+)
                    AND S.ID_CURVA_ABC = T.ID_CURVA_ABC(+)
                    AND A.ID_MOTIVO_VP = E.ID_MOTIVO_VP
                    AND A.DATA_CREATED < sysdate
                    AND A.ID_ITEM = F.ID_ITEM
                    AND A.ID_CATEGORIA = F.ID_CATEGORIA
                    AND F.ID_MARCA = G.ID_MARCA
                    AND A.ID_FUNCIONARIO = H.ID_FUNCIONARIO
                    AND A.ID_EMPRESA = H.ID_EMPRESA
                    and a.id_empresa = sl.id_empresa(+)
                    and a.id_venda_perdida = sl.id_venda_perdida(+)
                    and sl.id_status = st.id_status(+)
                    $andSql) a
                where 1 = 1
                $andSql2
                order by data_order desc";

            $sql1 = "select count(*) as totalCount from ($sql)";
            $stmt = $conn->prepare($sql1);
            $stmt->execute();
            $resultCount = $stmt->fetchAll();

            $sql = "select *
                from ( SELECT A.ID_EMPRESA,
                            A.ID_VENDA_PERDIDA,
                            A.ID_ITEM,
                            A.ID_CATEGORIA,
                            A.ID_FUNCIONARIO,
                            D.APELIDO AS EMP,
                            A.ID_PESSOA AS ID_CLIENTE,
                            P.NOME AS NOME_CLIENTE,
                            B.COD_ITEM||C.DESCRICAO as cod_item,
                            B.DESCRICAO       AS DESC_ITEM,
                            G.DESCRICAO       AS MARCA,
                            s.id_curva_abc       AS CURVA,
                            A.ID_MOTIVO_VP AS ID_TIPO,
                            E.DESCRICAO AS TIPO,
                            to_char(A.DATA_CREATED, 'DD/MM/RRRR HH24:MI') VP_DATA_LANCAMENTO,
                            A.DATA_CREATED as data_order,
                            A.USUARIO_CREATED AS VP_USUARIO_LANCAMENTO,
                            H.NOME AS VP_FUNCIONARIO_VENDA,
                            A.QTDE_ITEM AS VP_QTDE,
                            A.OBSERVACAO AS VP_COMENTARIO,
                            (select comentario from PRICING.X2_VP_COMENTARIO where id_empresa = A.ID_EMPRESA and id_venda_perdida = A.ID_VENDA_PERDIDA and id_status = 2 and rownum = 1) VP_APROVACAO_COMENTARIO,
                            --(select comentario from PRICING.X2_VP_COMENTARIO where id_empresa = A.ID_EMPRESA and id_venda_perdida = A.ID_VENDA_PERDIDA and id_status = 4 and rownum = 1) VP_CONCLUSAO_COMENTARIO,
                            nvl(pkg_x2_help_estoque.get_estoque_posicao_qtde(A.ID_EMPRESA, A.ID_ITEM, A.ID_CATEGORIA, A.DATA_CREATED),0) AS VP_ESTOQUE,
                            pkg_x2_help_estoque.get_estoque_ruptura_eventos(A.ID_EMPRESA, A.ID_ITEM, A.ID_CATEGORIA, A.DATA_CREATED, 180) AS VP_EVENTOS_RUPTURA_180D,
                            pkg_x2_help_estoque.get_estoque_ruptura_dias(A.ID_EMPRESA, A.ID_ITEM, A.ID_CATEGORIA, A.DATA_CREATED, 180) AS VP_DIAS_RUPTURA_180D,
                            pkg_x2_help_estoque.get_estoque_ruptura_eventos(A.ID_EMPRESA, A.ID_ITEM, A.ID_CATEGORIA, A.DATA_CREATED, 30) AS VP_EVENTOS_RUPTURA_30D,
                            pkg_x2_help_estoque.get_estoque_ruptura_dias(A.ID_EMPRESA, A.ID_ITEM, A.ID_CATEGORIA, A.DATA_CREATED, 30) AS VP_DIAS_RUPTURA_30D,
                            nvl(sl.id_status,1) as id_status,
                            nvl(st.descricao,'Pendente') as status
                    FROM MS.VE_VENDA_PERDIDA  A,
                            MS.PESSOA            P,
                            MS.TB_ITEM           B,
                            MS.TB_CATEGORIA      C,
                            MS.EMPRESA           D,
                            MS.VE_MOTIVO_VP      E,
                            MS.TB_ITEM_CATEGORIA F,
                            MS.TB_MARCA          G,
                            MS.FF_FUNCIONARIO    H,
                            MS.TB_ESTOQUE        S,
                            MS.TB_CURVA_ABC      T,
                            PRICING.X2_VP_SOLICITACAO SL,
                            PRICING.X2_VP_STATUS ST
                    WHERE A.ID_PESSOA = P.ID_PESSOA
                    AND A.ID_ITEM = B.ID_ITEM
                    AND A.ID_CATEGORIA = C.ID_CATEGORIA
                    AND A.ID_EMPRESA = D.ID_EMPRESA
                    AND A.ID_EMPRESA = S.ID_EMPRESA(+)
                    AND A.ID_ITEM = S.ID_ITEM(+)
                    AND A.ID_CATEGORIA = S.ID_CATEGORIA(+)
                    AND S.ID_CURVA_ABC = T.ID_CURVA_ABC(+)
                    AND A.ID_MOTIVO_VP = E.ID_MOTIVO_VP
                    AND A.DATA_CREATED < sysdate
                    AND A.ID_ITEM = F.ID_ITEM
                    AND A.ID_CATEGORIA = F.ID_CATEGORIA
                    AND F.ID_MARCA = G.ID_MARCA
                    AND A.ID_FUNCIONARIO = H.ID_FUNCIONARIO
                    AND A.ID_EMPRESA = H.ID_EMPRESA
                    and a.id_empresa = sl.id_empresa(+)
                    and a.id_venda_perdida = sl.id_venda_perdida(+)
                    and sl.id_status = st.id_status(+)
                    $andSql) a
                where 1 = 1
                $andSql2
                order by data_order desc";

            $sql = "
                SELECT PGN.*
                    FROM (SELECT ROWNUM AS RNUM, PGN.*
                            FROM ($sql) PGN) PGN
                    WHERE RNUM BETWEEN " . ($inicio +1 ) . " AND " . ($inicio + $final) . "
            ";

            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('VP_DATA_LANCAMENTO', new ValueStrategy);
            $hydrator->addStrategy('VP_QTDE', new ValueStrategy);
            $hydrator->addStrategy('status', new ValueStrategy);
            $stdClass = new StdClass;
            $resultSet = new HydratingResultSet($hydrator, $stdClass);
            $resultSet->initialize($results);

            $data = array();
            foreach ($resultSet as $row) {
                $data[] = $hydrator->extract($row);
            }

            $this->setCallbackData($data);
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        $objReturn = $this->getCallbackModel();
        $objReturn->total = $resultCount[0]['TOTALCOUNT'];

        return $objReturn;
    }

    public function listarvpcomentarioAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']['usuarioSistema'];

            $idEmpresa      = $this->params()->fromQuery('idEmpresa',null);
            $idVendaPerdida = $this->params()->fromQuery('idVendaPerdida',null);

            if(empty($idEmpresa)){
                
                $this->setCallbackData();
                $this->setMessage("Solicitação enviada com sucesso.");

                return $this->getCallbackModel();
            }

            $em = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql = "call pkg_x2_vp.gerar_solicitacao( :idEmpresa, :idVendaPerdida)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':idEmpresa', $idEmpresa);
            $stmt->bindParam(':idVendaPerdida', $idVendaPerdida);
            $stmt->execute();

            $sql = "select c.id_comentario,
                           c.id_empresa,
                           c.id_venda_perdida,
                           c.data data1,
                           to_char(c.data, 'DD/MM/RRRR HH24:MI') data,
                           c.usuario,
                           c.comentario,
                           c.id_status,
                           t.descricao as status
                    from x2_vp_comentario c,
                         x2_vp_solicitacao s,
                         x2_vp_status t
                    where c.id_empresa = s.id_empresa
                    and c.id_venda_perdida = s.id_venda_perdida
                    and c.id_status = t.id_status
                    and c.id_empresa = :idEmpresa
                    and c.id_venda_perdida = :idVendaPerdida
                    order by data1 desc
                    ";

            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':idEmpresa', $idEmpresa);
            $stmt->bindParam(':idVendaPerdida', $idVendaPerdida);
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('data', new ValueStrategy);
            $hydrator->addStrategy('status', new ValueStrategy);
            $stdClass = new StdClass;
            $resultSet = new HydratingResultSet($hydrator, $stdClass);
            $resultSet->initialize($results);

            $data = array();
            foreach ($resultSet as $row) {
                $data[] = $hydrator->extract($row);
            }

            $this->setCallbackData($data);
            $this->setMessage("Solicitação enviada com sucesso.");
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }

    public function listarstatusAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']['usuarioSistema'];

            // $idEmpresa      = $this->params()->fromQuery('idEmpresa',null);

            $em = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql = "select id_status,descricao from x2_vp_status";

            $stmt = $conn->prepare($sql);
            // $stmt->bindParam(':idEmpresa', $idEmpresa);
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('descricao', new ValueStrategy);
            $stdClass = new StdClass;
            $resultSet = new HydratingResultSet($hydrator, $stdClass);
            $resultSet->initialize($results);

            $data = array();
            foreach ($resultSet as $row) {
                $data[] = $hydrator->extract($row);
            }

            $this->setCallbackData($data);
            $this->setMessage("Solicitação enviada com sucesso.");
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }

    public function listarcurvasAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']['usuarioSistema'];

            // $idEmpresa      = $this->params()->fromQuery('idEmpresa',null);

            $em = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql = "select id_curva_abc from MS.TB_CURVA_ABC";

            $stmt = $conn->prepare($sql);
            // $stmt->bindParam(':idEmpresa', $idEmpresa);
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('id_curva_abc', new ValueStrategy);
            $stdClass = new StdClass;
            $resultSet = new HydratingResultSet($hydrator, $stdClass);
            $resultSet->initialize($results);

            $data = array();
            foreach ($resultSet as $row) {
                $data[] = $hydrator->extract($row);
            }

            $this->setCallbackData($data);
            $this->setMessage("Solicitação enviada com sucesso.");
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }

    public function listaritenscategoriasAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']['usuarioSistema'];

            $idEmpresa      = $this->params()->fromQuery('idEmpresa',null);
            $idVendaPerdida = $this->params()->fromQuery('idVendaPerdida',null);
            $idItem         = $this->params()->fromQuery('idItem',null);
            $idCategoria    = $this->params()->fromQuery('idCategoria',null);

            $em = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql = "select a.idx, a.id_empresa, a.id_item, a.id_categoria,
                        a.emp, a.cod_item, a.descricao, a.marca, a.estoque,
                        b.qtde_pendente,
                        b.qtde_total_12m,
                        b.qtde_total_6m,
                        b.qtde_total_3m,
                        round(b.qtde_total_12m/12,4) as med_12m,
                        round(b.qtde_total_6m/6,4) as med_6m,
                        round(b.qtde_total_3m/3,4) as med_3m
                    from (select decode(es.id_categoria,:idCategoria,1,0) as idx, es.id_empresa, es.id_item, es.id_categoria,
                            e.apelido as emp,
                            i.cod_item||c.descricao as cod_item,
                            i.descricao,
                            m.descricao as marca,
                            es.estoque
                            from ms.tb_estoque es,
                            ms.tb_item_categoria ic,
                            ms.tb_item i,
                            ms.tb_categoria c,
                            ms.tb_marca m,
                            ms.empresa e
                            where es.id_item = ic.id_item
                            and es.id_categoria = ic.id_categoria
                            and es.id_item = i.id_item
                            and es.id_categoria = c.id_categoria
                            and ic.id_marca = m.id_marca
                            and es.id_empresa = e.id_empresa
                            and e.id_empresa = :idEmpresa
                            and i.id_item = :idItem) a,
                            sjs.pan_rel_vendas_24_meses b
                    where a.emp = b.filial(+)
                    and a.cod_item = b.cod_item(+)
                    order by a.idx desc, a.estoque desc";

            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':idEmpresa', $idEmpresa);
            $stmt->bindParam(':idItem', $idItem);
            $stmt->bindParam(':idCategoria', $idCategoria);
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('qtde_pendente', new ValueStrategy);
            $hydrator->addStrategy('qtde_total_12m', new ValueStrategy);
            $hydrator->addStrategy('qtde_total_6m', new ValueStrategy);
            $hydrator->addStrategy('qtde_total_3m', new ValueStrategy);
            $hydrator->addStrategy('med_12m', new ValueStrategy);
            $hydrator->addStrategy('med_6m', new ValueStrategy);
            $hydrator->addStrategy('med_3m', new ValueStrategy);
            $stdClass = new StdClass;
            $resultSet = new HydratingResultSet($hydrator, $stdClass);
            $resultSet->initialize($results);

            $data = array();
            foreach ($resultSet as $row) {
                $data[] = $hydrator->extract($row);
            }

            $this->setCallbackData($data);
            $this->setMessage("Solicitação enviada com sucesso.");
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }

    public function aprovarAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']['usuarioSistema'];

            $idEmpresa      = $this->params()->fromPost('idEmpresa',null);
            $idVendaPerdida = $this->params()->fromPost('idVendaPerdida',null);
            $comentarioSo   = $this->params()->fromPost('comentarioSo',null);
            $comentarioAp   = $this->params()->fromPost('comentarioAp',null);

            $data = array();

            $em   = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql  = "call pkg_x2_vp.aprovar_solicitacao( :idEmpresa, :idVendaPerdida, :usuario, :comentario)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':idEmpresa', $idEmpresa);
            $stmt->bindParam(':idVendaPerdida', $idVendaPerdida);
            $stmt->bindParam(':usuario', $usuario);
            $stmt->bindParam(':comentario', $comentarioAp);
            $result = $stmt->execute();
            $this->setCallbackData($data);
            $this->setMessage("Solicitação enviada com sucesso.");
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }

    public function cancelarAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']['usuarioSistema'];

            $idEmpresa        = $this->params()->fromPost('idEmpresa',null);
            $idVendaPerdida   = $this->params()->fromPost('idVendaPerdida',null);
            $comentarioCanc   = $this->params()->fromPost('comentarioCanc',null);

            $data = array();

            $em = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql  = "call pkg_x2_vp.cancelar_solicitacao( :idEmpresa, :idVendaPerdida, :usuario, :comentario)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':idEmpresa', $idEmpresa);
            $stmt->bindParam(':idVendaPerdida', $idVendaPerdida);
            $stmt->bindParam(':usuario', $usuario);
            $stmt->bindParam(':comentario', $comentarioCanc);
            $result = $stmt->execute();
            $this->setCallbackData($data);
            $this->setMessage("Solicitação enviada com sucesso.");
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }
    
    public function concluirAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']['usuarioSistema'];

            $idEmpresa      = $this->params()->fromPost('idEmpresa',null);
            $idVendaPerdida = $this->params()->fromPost('idVendaPerdida',null);
            $comentarioConc = $this->params()->fromPost('comentarioConc',null);

            $data = array();

            $em = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql = "call pkg_x2_vp.concluir_solicitacao( :idEmpresa, :idVendaPerdida, :usuario, :comentario)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':idEmpresa', $idEmpresa);
            $stmt->bindParam(':idVendaPerdida', $idVendaPerdida);
            $stmt->bindParam(':usuario', $usuario);
            $stmt->bindParam(':comentario', $comentarioConc);
            $result = $stmt->execute();
            $this->setCallbackData($data);
            $this->setMessage("Solicitação enviada com sucesso.");
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }


}
