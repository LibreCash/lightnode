class Connection {

    constructor(id, server) {
        this.id = id.toString();
        this.server = server;
        this.notificationsMax = 500;
    }

    getNotifications (index, count) {
        var notifications = this.server.getNotifications();

        // todo: продумать логику connection/notification
        //  типы сообщений
        //      - общие сообщения
        //      - локальные сообщения для connection
        //  index -1 - забрать последние локальные
        //  проблема 1: при запуске могут быть уже важные сообщения,
        //      потому нужно забирать предыдущие

        
        if (index < 0 || index > notifications.length) {
            return {
                'notifications': [],
                'count': notifications.length
            };
        }

        if (count > this.notificationsMax) {
            count = this.notificationsMax;
        }

        count = this.notificationsMax;

        var a = notifications.slice(index, index + count);

        return {
            'notifications': notifications,
            'count': notifications.length
        };
    }
}

module.exports = Connection;
