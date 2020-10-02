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

    public function listarVpAction()
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
            $andSql .= " AND trunc(A.DATA_CREATED) >= '01/01/2019'";
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
                   to_char(A.DATA_CREATED, 'DD/MM/RRRR HH24:MI:SS') VP_DATA_LANCAMENTO,
                   --A.DATA_CREATED AS VP_DATA_LANCAMENTO,
                   A.USUARIO_CREATED AS VP_USUARIO_LANCAMENTO,
                   H.NOME AS VP_FUNCIONARIO_VENDA,
                   A.QTDE_ITEM AS VP_QTDE,
                   A.OBSERVACAO AS VP_COMENTARIO,
                   pkg_x2_help_estoque.get_estoque_posicao_qtde(A.ID_EMPRESA, A.ID_ITEM, A.ID_CATEGORIA, A.DATA_CREATED) AS VP_ESTOQUE,
                   pkg_x2_help_estoque.get_estoque_ruptura_eventos(A.ID_EMPRESA, A.ID_ITEM, A.ID_CATEGORIA, A.DATA_CREATED, 180) AS VP_EVENTOS_RUPTURA_180D,
                   pkg_x2_help_estoque.get_estoque_ruptura_dias(A.ID_EMPRESA, A.ID_ITEM, A.ID_CATEGORIA, A.DATA_CREATED, 180) AS VP_DIAS_RUPTURA_180D,
                   pkg_x2_help_estoque.get_estoque_ruptura_eventos(A.ID_EMPRESA, A.ID_ITEM, A.ID_CATEGORIA, A.DATA_CREATED, 30) AS VP_EVENTOS_RUPTURA_30D,
                   pkg_x2_help_estoque.get_estoque_ruptura_dias(A.ID_EMPRESA, A.ID_ITEM, A.ID_CATEGORIA, A.DATA_CREATED, 30) AS VP_DIAS_RUPTURA_30D,
                   'EVERTON' as vp_usuario_confirmacao,
                   sysdate as vp_data_confirmacao,
                   'Comentário ....' as vp_comentario_confirmacao,
                   null status
                   
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
                   MS.TB_CURVA_ABC      T
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
            --and a.id_empresa = 8
            $andSql
            --and rownum <= 5
             order by a.data_created desc";
            
            $conn = $em->getConnection();
            $stmt = $conn->prepare($sql);
            
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('VP_QTDE', new ValueStrategy);
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

            $sql = "select 'Rogerio' usuario, 'Teste null' comentario_so , to_char(sysdate, 'DD/MM/RRRR HH24:MI:SS') as data_so from dual";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('data_so', new ValueStrategy);
            $stdClass = new StdClass;
            $resultSet = new HydratingResultSet($hydrator, $stdClass);
            $resultSet->initialize($results);

            $data = array();
            foreach ($resultSet as $row) {
                $data[] = $hydrator->extract($row);
            }

            // $data[] = array('usuario'=> 'Rogerio','obs'=> $obs, 'data' => '29/09/2020');
            // $data[] = array('usuario'=> 'Joao','obs'=> $obs);

            $this->setCallbackData($data);
            $this->setMessage("Solicitação enviada com sucesso.");
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }

    public function inserirAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']['usuarioSistema'];

            $emp            = $this->params()->fromPost('emp',null);
            $idVendaPerdida = $this->params()->fromPost('idVendaPerdida',null);
            $comentarioAp   = $this->params()->fromPost('comentarioAp',null);

            $data = array();

            // $em = $this->getEntityManager();
            // $conn = $em->getConnection();

            // $sql = "call pkg_fi_desconto_com_nota.inserir( :emp, :idlancamento, :numero_nota, :usuario)";
            // $stmt = $conn->prepare($sql);
            // $stmt->bindParam(':emp', $emp);
            // $stmt->bindParam(':idlancamento', $idlote);
            // $stmt->bindParam(':numero_nota', $nrnf);
            // $stmt->bindParam(':usuario', $usuario);
            // $result = $stmt->execute();
            $this->setCallbackData($data);
            $this->setMessage("Solicitação enviada com sucesso.");
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }


}
