let catalogServices = (()=>{

    function loadCatalog() {
        let endpoint = 'posts?query={}&sort={"_kmd.ect": -1}';
        return requester.get('appdata', endpoint, 'Kinvey')
    }
    
    

    function createPost(username, linkUrl, linTitle, image, comment) {
        let postData = {
            author: username,
            title: linTitle,
            description: comment,
            url: linkUrl,
            imageUrl:image
        };
        return requester.post('appdata', 'posts', 'Kinvey', postData);

    }

    function deletePost(id) {
        let endpoint = `posts/${id}`;
        return requester.remove('appdata', endpoint, 'Kinvey')
    }

    function loadPostById(id){
        let endpoint = `posts/${id}`;
        return requester.get('appdata', endpoint, 'Kinvey')
    }


    function updatePost(username, linkUrl, linTitle, image, comment, id) {
        let postData = {
            author: username,
            title: linTitle,
            description: comment,
            url: linkUrl,
            imageUrl:image
        };
        let endpoint = `posts/${id}`;
        return requester.update('appdata', endpoint, 'Kinvey', postData);

    }

    function loadMyPosts(username) {
        let endpoint = `posts?query={"author":"${username}"}&sort={"_kmd.ect": -1}`;
        return requester.get('appdata', endpoint, 'Kinvey')
    }

    function createComment(comentData) {

        return requester.post('appdata', 'comments', 'Kinvey', comentData)
    }

    function loadAllComments(postId) {
        let endpoint = `comments?query={"postId":"${postId}"}&sort={"_kmd.ect": -1}`;
        return requester.get('appdata', endpoint, 'Kinvey')
    }

    function deleteComment(id) {
        let endpoint = `comments/${id}`;
        return requester.remove('appdata', endpoint, 'Kinvey')
    }



    return{
        loadCatalog,
        createPost,
        deletePost,
        loadPostById,
        updatePost,
        loadMyPosts,
        createComment,
        loadAllComments,
        deleteComment,
    }

})();