$(()=>{

     //Attach Event Handlers
     (()=>{
        $('#menu').find('a[data-target]').click(navigateTo);

         $('#registerForm').submit(registerUser);
         $('#loginForm').submit(loginUser);
         $('#linkMenuLogout').click(logOutUser);

         $('#linkCatalog').click(()=>{
             loadCatalog();
             showView('Catalog')
         });

         $('#linkMyPostsCatalog').click(()=>{
             loadMyPosts();
             showView('MyPosts')
         });


         $('#submitForm').submit(createPost);





    })();
    const templates = {};

    //----------------LOAD TEMPLATES -----------------------------------
    loadTemplates();

    async  function loadTemplates() {
        const [postCatalog, postPartial, myPostsCatalog, myPostsPartial, postDetAndComm, commentsCatalog, commentsPartial ] =
            await Promise.all([
                $.get('./templates/postCatalog.html'),
                $.get('./templates/postPartial.html'),
                $.get('./templates/myPostsCatalog.html'),
                $.get('./templates/myPostsPartial.html'),
                $.get('./templates/postDetAndComm.html'),
                $.get('./templates/commentsCatalog.html'),
                $.get('./templates/commentsPartial.html'),

            ]);

        templates['allPosts'] = Handlebars.compile(postCatalog);
        Handlebars.registerPartial('post', postPartial);

        templates['myPosts'] = Handlebars.compile(myPostsCatalog);
        Handlebars.registerPartial('myPost', myPostsPartial);

        templates['postDetAndComm'] = Handlebars.compile(postDetAndComm);

        templates['commentsCatalog'] = Handlebars.compile(commentsCatalog);
        Handlebars.registerPartial('article', commentsPartial);
    }



     //----REGISTER USER----

    function registerUser(ev) {
        ev.preventDefault();

        let registerUsername = $('#registerUsername');
        let registerPasswd = $('#registerPasswd');
        let registerRepeatPas = $('#registerRepeatPas');

        let userName = registerUsername.val();
        let password = registerPasswd.val();
        let repeatPasssword = registerRepeatPas.val();

        if(validation(userName, password, repeatPasssword)){

            auth.register(userName, password)
                .then((userInfo)=>{
                    registerUsername.val('');
                    registerPasswd.val('');
                    registerRepeatPas.val('');
                    saveSession(userInfo);
                    showInfo("User registration successful." );
                    loadCatalog();
                    showView("Catalog")
                })
                .then(handleError)
        }

    }


    //------LOGIN-------------
    function loginUser(ev) {
        ev.preventDefault();

        let loginUsername = $('#loginUsername');
        let loginPasswd = $('#loginPasswd');

        let userName = loginUsername.val();
        let password = loginPasswd.val();


        if(validation(userName, password, password)) {

            auth.login(userName, password)
                .then((userInfo) => {
                    loginUsername.val('');
                    loginPasswd.val('');
                    saveSession(userInfo);
                    showInfo("Login successful." );
                    loadCatalog();
                    showView("Catalog")

                })
                .then(handleError)
        }

    }

    //------LOGOUT-------------

    function logOutUser() {
        auth.logout()
            .then(() =>{
                sessionStorage.clear();
                showInfo("Logout successful." );
                userLoggedOut();
            })
            .then(handleError)
    }


    //--- VALIDATION ---
    function validation(userName, password, repeatPasssword) {
        if(userName.length < 3 ){
            showError('username should be at least 3 characters');

            return false
        }
        if(!/^[a-zA-Z]+$/g.test(userName)){
            showError('username should contain only english alphabet letters');
            return false
        }

        if(password.length < 6 ){
            showError('password should be at least 6 characters');
            return false
        }

        if(!/^[a-zA-Z0-9]+$/g.test(userName)){
            showError('password should contain only english alphabet letters');
            return false
        }

        if(password !== repeatPasssword){
            showError("password doesn't match");
            return false
        }
        return true
    }


    //-------CATALOG SCREEN-----------

    function loadCatalog() {

        catalogServices.loadCatalog()
            .then((catalogData) =>{
                let content = $('#viewCatalog');
                displayPosts(catalogData, content)
            })

    }


    function displayPosts(postData,content) {

       // let content = $('#viewCatalog');
        content.empty();

        let counter = 1;
        for(let el of postData){

            el['countNum'] = counter;
            let date = calcTime(el['_kmd']['lmt']);
            let username = el['author'];
            el['info'] = `submitted ${date} ago by ${username}`;

            if(sessionStorage.getItem('username') === username){
                el.isAuthor = true;
            }

        counter++
        }

        let context = {
            postData
        };
        content.html(templates['allPosts'](context));

        let deleteBtn = $(content).find('.post').find('.delete');
        deleteBtn.click(deletePost);

        let editBtn = $(content).find('.post').find('.edit');
        editBtn.click(loadEditPost);

        let detailBtn = $(content).find('.post').find('.detail');
        detailBtn.click(loadDetailPost);

    }

    //---------DETAIL POST--------

    function loadDetailPost() {
        let id = $(this).parent().parent().parent().parent().parent().parent().attr('data-id');

        catalogServices.loadPostById(id)
            .then((detailsPostData)=>{
                displayPostDetails(detailsPostData);

            });


        function displayPostDetails(detailsPostData) {
           // console.log(detailsPostData)
            let content = $('#viewComments');

              let date = calcTime(detailsPostData['_kmd']['lmt']);
              let username = detailsPostData['author'];


               detailsPostData['info'] = `submitted ${date} ago by ${username}`;

         if(sessionStorage.getItem('username') === username){
                 detailsPostData.isAuthor = true;
         }

            let output =  templates['postDetAndComm'](detailsPostData);           //РАБОТИ

            content.html(output);
            showView('Comments');

            let editBtn = $(content).find('.post').find('.edit');
            editBtn.click(loadEditPost);


            let deleteBtn = $(content).find('.post').find('.delete');
            deleteBtn.click(deletePost);

            let commentForm = $(content).find('.post-content').find('#commentForm');

            $('#commentForm').submit(createComment);


            let commentsContent = $(content).find('#commentsContent');
            showComments(id, commentsContent)
        }

    }

    //---------SHOW COMMENTS--------

    function showComments(postId, content) {

       // content.empty();
        catalogServices.loadAllComments(postId)
            .then((articles) =>{


            for(let el of articles){
                let date = calcTime(el['_kmd']['lmt']);
                let username = el['author'];
                el['info'] = `submitted ${date} ago by ${username}`;


                if(sessionStorage.getItem('username') === username){
                    el.isAuthor = true;
                }
            }
                let context = {
                    articles
                };
                content.html(templates['commentsCatalog'](context));

                let deleteBtn = content.find('.post').find('.delete');
                deleteBtn.click(deleteComment);

            });


        function deleteComment() {
            let commentId = $(this).parent().parent().attr('data-id');
            catalogServices.deleteComment(commentId)
                .then(()=>{
                    showInfo('Comment deleted.');
                    showComments(postId, content)
                })
        }

    }


    //---------CREATE COMMENTS--------
    function createComment(ev) {
        ev.preventDefault();


        let content = $('#viewComments');
        let commentsContent = $(content).find('#commentsContent');

        let postId = $(this).parent().attr('data-id');

        let text  = $(this).find('#text');
        let textContent  = text.val();

        let userName = sessionStorage.getItem('username');


        let comment = {
            postId: postId,
            content: textContent,
            author: userName
        };

        catalogServices.createComment(comment)
            .then(() =>{
                text.val('');
                showInfo('Comment created.');
                showComments(postId, commentsContent)
            });


    }




    //---------CREATE POST--------

    function createPost(ev) {
        ev.preventDefault();


        let username = sessionStorage.getItem('username');

        let linkUrlInput = $('#linkUrl');
        let linTitleInput = $('#linTitle');
        let imageInput = $('#image');
        let commentInput = $('#comment');


        let linkUrl = linkUrlInput.val();
        let linTitle = linTitleInput.val();
        let image = imageInput.val();
        let comment = commentInput.val();


        if(postValidation(linkUrl)){

            catalogServices.createPost(username, linkUrl, linTitle, image, comment)
                .then(()=>{
                    linkUrlInput.val('');
                    linTitleInput.val('');
                    imageInput.val('');
                    commentInput.val('');
                    showInfo("Post created." );
                    showView("Catalog");
                    loadCatalog();
                })

        }

    }


    function postValidation(linkUrl) {
        if(!linkUrl.startsWith('http')){
            showError('The Url should start with "http"');
            return false
        }
        return true
    }

    //---------EDIT POST--------

    function loadEditPost() {
        let id = $(this).parent().parent().parent().parent().parent().parent().attr('data-id');
        $('#editPostForm').submit(editPost);

        catalogServices.loadPostById(id)
            .then((postInfo)=>{
                openEdiPost(postInfo)
            });


        function openEdiPost(postInfo) {

            let form = $('#editPostForm');
            form.find('input[name="url"]').val(postInfo.url);
            form.find('input[name="title"]').val(postInfo.title);
            form.find('input[name="image"]').val(postInfo.imageUrl);
            form.find('textarea[name="description"]').val(postInfo.description);
            showView('Edit');
        }

        function editPost(ev) {
            ev.preventDefault();

            let form = $('#editPostForm');

            let linkUrl = form.find('input[name="url"]').val();
            let linTitle = form.find('input[name="title"]').val();
            let image = form.find('input[name="image"]').val();
            let comment = form.find('textarea[name="description"]').val();

            let username = sessionStorage.getItem('username');

            if(postValidation(linkUrl)){
                catalogServices.updatePost(username, linkUrl, linTitle, image, comment, id)
                    .then(()=>{

                        showInfo(`Post ${linTitle} updated.`);
                        showView("Catalog");
                        loadCatalog();
                    })
            }

        }

    }



    //---------DELETE POST--------

    function deletePost() {
        let id = $(this).parent().parent().parent().parent().parent().parent().attr('data-id');

        catalogServices.deletePost(id)
            .then(() =>{
                showInfo('Post deleted.');
                showView('Catalog');
                loadCatalog()
            });

    }




    //---------LOAD MY POSTS--------

    function loadMyPosts() {
        let username = sessionStorage.getItem('username');
        catalogServices.loadMyPosts(username)
            .then((myPosts) =>{
                let content = $('#viewMyPosts');
                displayPosts(myPosts, content)

            });
    }






    function navigateTo() {
        let dataTarget = $(this).attr('data-target');

        showView(dataTarget);
    }

    function calcTime(dateIsoFormat) {
        let diff = new Date - (new Date(dateIsoFormat));
        diff = Math.floor(diff / 60000);
        if (diff < 1) return 'less than a minute';
        if (diff < 60) return diff + ' minute' + pluralize(diff);
        diff = Math.floor(diff / 60);
        if (diff < 24) return diff + ' hour' + pluralize(diff);
        diff = Math.floor(diff / 24);
        if (diff < 30) return diff + ' day' + pluralize(diff);
        diff = Math.floor(diff / 30);
        if (diff < 12) return diff + ' month' + pluralize(diff);
        diff = Math.floor(diff / 12);
        return diff + ' year' + pluralize(diff);
        function pluralize(value) {
            if (value !== 1) return 's';
            else return '';
        }
    }



    function showView(viewName) {
        // Hide all views and show the selected view only
        $('main > section').hide();
        $('#view' + viewName).show();
    }


    if(sessionStorage.getItem('authtoken') === null){
        userLoggedOut();
    }else{
        userLoggedIn();
    }
    
    function userLoggedIn() {
        $('#menu').show();
        $('#viewComments').show();
        $('#viewWelcome').hide();
        let username = sessionStorage.getItem('username');
        let profile = $('#profile');
        profile.show();
        profile.find('span').text(username);
        showView('Catalog');
        loadCatalog();
    }

    function userLoggedOut() {
        $('#menu').hide();
        $('#profile').hide();
        $('#viewWelcome').show();
        showView('Welcome');
    }



    function saveSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken;
        sessionStorage.setItem('authtoken', userAuth);
        let userId = userInfo._id;
        sessionStorage.setItem('userId', userId);
        let username = userInfo.username;
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('name', userInfo['name']);
        userLoggedIn();
    }

    function handleError(reason) {
        showError(reason.responseJSON.description);
    }

    function showInfo(message) {
        let infoBox = $('#infoBox');
        infoBox.text(message);
        infoBox.show();
        setTimeout(() => infoBox.fadeOut(), 3000);
    }

    function showError(message) {
        let errorBox = $('#errorBox');
        errorBox.text(message);
        errorBox.show();
        setTimeout(() => errorBox.fadeOut(), 3000);
    }


    // Handle notifications
    $(document).on({
        ajaxStart: () => $("#loadingBox").show(),
        ajaxStop: () => $('#loadingBox').fadeOut()
    });

});