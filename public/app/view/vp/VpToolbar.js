Ext.define('App.view.vp.VpToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'VpToolbar',
    id: 'VpToolbar',
    itemId: 'VpToolbar',
    margin: '2 2 2 2',
    requires: [

    ],
    constructor: function() {
        var me = this;

        var empbx = Ext.create('Ext.form.field.ComboBox',{
            width: 70,
            id: 'bxemp',
            itemId: 'bxemp',
            store: Ext.data.Store({
                fields: [{ name: 'idEmpresa' }, { name: 'apelido' }],
                proxy: {
                    type: 'ajax',
                    url: BASEURL + '/api/Vp/listarempresas',
                    reader: {
                        type: 'json',
                        root: 'data'
                    }
                }
            }),
            queryParam: 'codigo',
            queryMode: 'local',
            displayField: 'nome',
            valueField: 'nome',
            emptyText: 'Emp',
            forceSelection: true,
            disabled: true,
            margin: '1 1 1 1',
            listeners: {
               
            }
        });

        empbx.store.load(function(r){
            empbx.enable();
            empbx.select(USUARIO.empresa);
        });

        var dtinicio = Ext.create('Ext.form.field.Date',{
            name: 'dtinicio',
            id: 'dtinicio',
            fieldLabel: 'Data de',
            margin: '2 2 2 12',
            width: 180,
            labelWidth: 50,
            format: 'd/m/Y',
            altFormats: 'dmY',
            emptyText: '__/__/____'
        });

        var dtfim = Ext.create('Ext.form.field.Date',{
            name: 'dtfim',
            id: 'dtfim',
            fieldLabel: 'até',
            margin: '2 2 2 2',
            width: 132,
            labelWidth: 20,
            format: 'd/m/Y',
            altFormats: 'dmY',
            emptyText: '__/__/____'
        });

        var btnSearch = Ext.create('Ext.button.Button',{
            
            iconCls: 'fa fa-search',
            tooltip: 'Consultar',
            margin: '1 1 1 1',
            handler: function(form) {

                var myStore = me.up('panel').down('grid').getStore();

                var emp = '';

                if(me.down('#bxemp').getRawValue()){
                    var emp = me.down('#bxemp').selection.data.idEmpresa;
                }

                var dtinicio = me.down('#dtinicio').getRawValue();
                var dtfim = me.down('#dtfim').getRawValue();

                var params =  {
                    emp : emp,
                    dataInicio : dtinicio,
                    dataFim : dtfim
                };

                myStore.getProxy().setExtraParams(params);

                myStore.load();
            }
        });

        var btnClean = Ext.create('Ext.button.Button',{
            
            iconCls: 'fa fa-file',
            tooltip: 'Limpar',
            margin: '1 1 1 4',
            handler: function(form) {

            }
        });

        var btnPlus = Ext.create('Ext.button.Button',{
            
            iconCls: 'fa fa-plus',
            tooltip: 'Limpar',
            margin: '2 6 2 2',
            renderer: function (v) {
                return v;
            },
            handler: function(form) {

                var objWindow = Ext.getCmp('VpWindow');

                var myGrid = me.up('container').down('grid');
                
                if(myGrid.getSelection() == 0){

                    Ext.Msg.alert('Alerta','Favor selecionar uma venda pedida.');

                    return null
                    
                }

                console.log(myGrid.getSelection());
                        
                if(!objWindow){
                    objWindow = Ext.create('App.view.vp.VpWindow');
                    objWindow.show();
                }

                objWindow.down('panel').down('#winCliente').setValue(myGrid.getSelection()[0].data.nomeCliente);

            }
        });

        Ext.applyIf(me, {

            items: [
                empbx,
                dtinicio,
                dtfim,
                btnSearch,
                btnClean,
                '->',
                btnPlus
            ]

        });

        me.callParent(arguments);

    }

});
