Ext.Loader.setConfig({enabled: true, disableCaching: true});

Ext.application({
    name: 'App',
    appFolder: 'app',

    paths: {
        'Ext.ux': 'app/ux'
    },

    requires: [
        'Ext.ux.util.Format',
        'App.view.Viewport',
        'App.controller.VpController'
    ],
    
    controllers: [
        'ApplicationController',
        'VpController'
    ],
    
    mainView: 'App.view.Viewport',

    // defaultToken: 'home',
    acessos: [],
    launch: function() {
        var me = this;

        if(!USUARIO && USUARIO != '""')
        window.location.href = BASEURL + '/login';

        // Recupera os dados do usuário
        USUARIO = Ext.decode(USUARIO);

        Ext.Ajax.request({
            url : BASEURL + '/api/index/listarAcessos',
            method: 'POST',
            async : false,
            params: {cpf: USUARIO.id},
            success: function (response) {
                var result = Ext.decode(response.responseText);

                var arrayAcesso = new Array();
                result.data.forEach(function(record){
                    arrayAcesso.push(record.acesso);
                });

                me.acessos = arrayAcesso;

                // var appController = App.app.getController('ApplicationController');
                // appController.redirectTo('home')
            }
        });

        // console.log(USUARIO);
    }

});
