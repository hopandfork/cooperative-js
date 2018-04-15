# Calcolo distribuito su WebBrowser #
L'applicazione è basata su una libreria definita nel progetto *client* che viene integrata nel progetto *example* e comunica con il **WebSocketServer** implementato con **nodejs** attraverso il progetto *server*.

# Prerequisiti #
Versione **nodejs** >= *v6.12.0* e **npm** >= *3.10.10*.

# Utilizzo #
Per prima cosa entrare nel progetto *client* ed eseguire `npm install` dopodiché va eseguito il comando `npm run build`.

Successivamente andare nel progetto *server* ed eseguire `npm install` dopodiché va eseguito il comando `npm start`.

Infine andare nel progetto *example*, eseguire `npm install` e subito dopo `npm start`.
Il calcolo di esempio eseguito dall'applicazione necessita di 4 istanze di un web Browser come Google Chrome, e su 3 di esse viene calcolato: 4+5+3, 4+5+4 e 4+5+5. La pagina aggiornata per ultima riesce a realizzare l'aggregazione dei risultati delle tre somme.
I risultati sono osservabili dalla modalità sviluppatore osservando la console Javascript.

# Sviluppo #
Nel caso vengano apportate modifiche alla libreria client è necessario rieseguire il comando `npm run build` e per importare la nuova versione bisogna eliminare dai progetti *server* ed *example* la cartella *./node_modules/client*.
