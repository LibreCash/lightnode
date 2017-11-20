class Connection {

    constructor(id, server) {
        this.id = id.toString();
        this.server = server;
        this.notificationsMax = 500;
        this.lastNotificationIndex = 0;
    }

    get node () {
        return this.server.getNode();
    }
    
    onPing () {
        // todo: refresh disconnect timer
        //  notify anomality also
        //this.onClientDisconnected();
    }

    onClientConnected () {
        this.node.onClientConnected(this);
    }

    onClientDisconnected () {
        this.node.onClientDisconnected(this);
    }

    getNotifications (index, count) {
        // todo: check index, count

        var notifications = this.server.getNotifications();

        // todo: продумать логику connection/notification
        //  типы сообщений
        //      - общие сообщения
        //      - локальные сообщения для connection
        //  index -1 - забрать последние локальные
        //  проблема 1: при запуске могут быть уже важные сообщения,
        //      потому нужно забирать предыдущие

        /*
        if (index < 0 || index > notifications.length) {
            return {
                'notifications': [],
                'count': notifications.length
            };
        }*/

        if (index < 0) {
            index = this.lastNotificationIndex;
        }

        if (count > this.notificationsMax) {
            count = this.notificationsMax;
        }

        var selected = notifications.slice(index, index + count);

        this.lastNotificationIndex += selected.length;

        return {
            'notifications': selected,
            'count': notifications.length
        };
    }
}

module.exports = Connection;
