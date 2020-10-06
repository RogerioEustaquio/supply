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

        $emp        = $this->params()->fromQuery('emp',null);
        $dataInicio = $this->params()->fromQuery('dataInicio',null);
        $dataFim    = $this->params()->fromQuery('dataFim',null);

        $andSql = '';

        if($emp  && $emp != 20){

            $andSql = " and a.id_empresa = $emp";
        
        }

        if($dataInicio){
            $andSql .= " AND trunc(A.DATA_CREATED) >= '$dataInicio'";
        }else{
            $andSql .= " AND trunc(A.DATA_CREATED) >= sysdate-30";
        }

        if($dataFim){
            $andSql .= " AND trunc(A.DATA_CREATED) <= '$dataFim'";
        }
        
        try {

            $session = $this->getSession();
            $usuario = $session['info'];

            $em = $this->getEntityManager();

            $sql = "--CREATE TABLE TMP_VP_SOLICITACAO AS
                SELECT A.ID_EMPRESA,
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
                        'Teste Aprovacao' VP_APROVACAO_COMENTARIO,
                        'Teste Conclusao' VP_CONCLUSAO_COMENTARIO,
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
                $andSql
                --and rownum <= 5
                order by data_order desc";

            $conn = $em->getConnection();
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
        
        return $this->getCallbackModel();
    }

    public function listarvpcomentarioAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']['usuarioSistema'];

            $emp            = $this->params()->fromQuery('emp',null);
            $idVendaPerdida = $this->params()->fromQuery('idVendaPerdida',null);

            if(empty($emp)){
                
                $this->setCallbackData();
                $this->setMessage("Solicitação enviada com sucesso.");

                return $this->getCallbackModel();
            }

            $em = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql = "call pkg_x2_vp.gerar_solicitacao( :emp, :idVendaPerdida)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':emp', $emp);
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
                    and c.id_empresa = :emp
                    and c.id_venda_perdida = :idVendaPerdida
                    order by data1 desc
                    ";

            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':emp', $emp);
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

    public function listaritenscategoriasAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']['usuarioSistema'];

            $emp            = $this->params()->fromQuery('emp',null);
            $idVendaPerdida = $this->params()->fromQuery('idVendaPerdida',null);
            $idItem         = $this->params()->fromQuery('idItem',null);
            $idCategoria    = $this->params()->fromQuery('idCategoria',null);

            $em = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql = "select 'RA' emp, '$emp' id_empresa, '$idVendaPerdida' id_venda_perdida from dual
                    union
                    select 'RJ' emp, '$emp' id_empresa, '$idVendaPerdida' id_venda_perdida from dual
                    union
                    select 'AP' emp, '$emp' id_empresa, '$idVendaPerdida' id_venda_perdida from dual";

            $stmt = $conn->prepare($sql);
            // $stmt->bindParam(':emp', $emp);
            // $stmt->bindParam(':idVendaPerdida', $idVendaPerdida);
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('emp', new ValueStrategy);
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

    public function AprovarAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']['usuarioSistema'];

            $emp            = $this->params()->fromPost('emp',null);
            $idVendaPerdida = $this->params()->fromPost('idVendaPerdida',null);
            $comentarioSo   = $this->params()->fromPost('comentarioSo',null);
            $comentarioAp   = $this->params()->fromPost('comentarioAp',null);

            $data = array();

            $em   = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql  = "call pkg_x2_vp.aprovar_solicitacao( :emp, :idVendaPerdida, :usuario, :comentario)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':emp', $emp);
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

    public function CancelarAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']['usuarioSistema'];

            $emp              = $this->params()->fromPost('emp',null);
            $idVendaPerdida   = $this->params()->fromPost('idVendaPerdida',null);
            $comentarioCanc   = $this->params()->fromPost('comentarioCanc',null);

            $data = array();

            $em = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql  = "call pkg_x2_vp.cancelar_solicitacao( :emp, :idVendaPerdida, :usuario, :comentario)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':emp', $emp);
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

    public function AtendimentoAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']['usuarioSistema'];

            $emp            = $this->params()->fromPost('emp',null);
            $idVendaPerdida = $this->params()->fromPost('idVendaPerdida',null);
            $comentarioCanc = $this->params()->fromPost('comentarioCanc',null);

            $data = array();

            $em = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql = "call pkg_x2_vp.aprovar_solicitacao( :emp, :idVendaPerdida, :usuario, :comentario)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':emp', $emp);
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
    
    public function ConcluirAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']['usuarioSistema'];

            $emp            = $this->params()->fromPost('emp',null);
            $idVendaPerdida = $this->params()->fromPost('idVendaPerdida',null);
            $comentarioConc = $this->params()->fromPost('comentarioConc',null);

            $data = array();

            $em = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql = "call pkg_x2_vp.concluir_solicitacao( :emp, :idVendaPerdida, :usuario, :comentario)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':emp', $emp);
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
