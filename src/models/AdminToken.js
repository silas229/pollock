/**
 * @property {String} poll_id token/_id of the poll this AdminToken is associated with
 * @property {String} _id will be generated automatically by nedb, this is the admin token
 */
class AdminToken{
    constructor(poll){
        this.poll_id = poll._id;
    }
}

export default AdminToken;