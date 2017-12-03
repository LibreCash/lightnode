const
    should = require('should'),
    db = require('../../lib/db');

var options = require('../../config/default.json');
    
describe("db", () => {
    it("connect exception", async () => {
        var success;
        try {
            await db.connect(123);
            success = false;
        }
        catch (e) {
            success = true;
        }
        (success).should.be.true();

        var success;
        try {
            await db.connect('mongodb://localhost:111/nodb');
            success = false;
        }
        catch (e) {
            success = true;
        }
        (success).should.be.true();
    });

    it('connect', async () => {
        await db.connect(options.masternode0.db);
    });

    it("setup account", async () => {
        await db.connect(options.masternode0.db);
        await db.setupAccount({
            username: 'test',
            password: '123'
        });
        await db.setupAccount({
            username: 'test1',
            password: '456'
        });
        var Acount = db.getAccountModel();
        var accounts = await Account.find({});
        accounts.should.have.length(1);
    });
    it("save tickers", async () => {
        await db.connect(options.masternode0.db);
        await db.saveTickers({});
    });
    it("net nodes", async () => {
        await db.connect(options.masternode0.db);
//        NetNode
    });
    it("notifications", async () => {
        await db.connect(options.masternode0.db);
//        Notification
    });
    it("light node state", async () => {
        await db.connect(options.masternode0.db);
//        updateLightNodeState
    });
    it("master node state", async () => {
        await db.connect(options.masternode0.db);
//        updateLightNodeState      
    });
});

