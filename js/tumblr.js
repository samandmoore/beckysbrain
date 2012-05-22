(function ($, window, document, utils) {

    var _baseTumblrPostsApiUrl = 'http://api.tumblr.com/v2/blog/beckysbrain.tumblr.com/posts',
        _tumblrApiKey = '?api_key=X9UXZNouFnf2rJSR0hpKlUed3E5ssvnVTylwhOOrEUOEbgGVcN',
        _tagCache = [],
        $filters = $('#filters');

    function _normalizeTagName(tagName) {
        return tagName.replace(/[^aA-zZ0-9]/gi, '');
    }
        
    function _addTag(tagName, normalizedTagName) {
        _tagCache.push(normalizedTagName);
        _addFilter(tagName, normalizedTagName);
    }
    
    function _addFilter(tagName, normalizedTagName) {
        var $filterItem = $('<li />'),
            $filterLink = $('<a />');
            
        $filterLink.attr('data-filter', '.' + normalizedTagName);
        $filterLink.attr('href', '#' + normalizedTagName);
        $filterLink.text(tagName);
        
        $filterItem.append($filterLink);
        
        $filters.append($filterItem);
    }
        
    function _loadPosts(start, count, callback) {
        var posts = [],
            jqxhr = $.ajax({
                url: _baseTumblrPostsApiUrl + _tumblrApiKey,
                dataType: 'jsonp',
                jsonp: 'jsonp'
            });
        
        jqxhr.done(function (data) {
            //populate results
            $.each(data.response.posts, function (idx, el) {
                posts.push(_buildPostElement(el));
            });
            
            callback(posts);
        });
        
        jqxhr.fail(function (data) {
            // do something about error
        });
    }
    
    function _buildPostElement(postData) {
        var post = null;
        
        console.log(postData);
                
        switch (postData.type) {
        
            case 'text':
                post = _buildTextPost(postData);
                break;
            
            case 'photo':
                post = _buildPhotoPost(postData);
                break;
                
            default:
                post = _buildTextPost(postData);
        }
        
        return post;
    }
    
    function _buildBasePost(postData) {
        var $root = $('<div />'),
            $title = $('<div class="title" />'),
            $body = $('<div class="body" />'),
            $date = $('<div class="date" />'),
            colorString = utils.generateRandomColor();
        
        $root.addClass('post');
        $root.css('background-color', colorString);
        $root.attr('data-date', postData.date);
        $root.attr('data-timestamp', postData.timestamp);
        $root.attr('data-id', postData.id);
        $root.attr('data-post-url', postData.post_url);
        
        $date.text(postData.date);
        
        $root.append($title);
        $root.append($date);
        $root.append($body);
        
        if (postData.tags.length > 0) {
            $.each(postData.tags, function (idx, el) {
                var normalizedTagName = _normalizeTagName(el);
                
                if ($.inArray(normalizedTagName, _tagCache) === -1) {
                    _addTag(el, normalizedTagName);
                }
                
                $root.addClass(normalizedTagName);
            });
        }
        
        return $root;
    }
    
    function _buildTextPost(postData) {
        var $root = _buildBasePost(postData),
            $title = $root.find('.title'),
            $body = $root.find('.body');
        
        $title.html(postData.title);
        $body.html(postData.body);
        
        return $root[0];
    }
    
    function _buildPhotoPost(postData) {
        var $root = _buildBasePost(postData),
            $title = $root.find('.title'),
            $body = $root.find('.body');
        
        $body.html(postData.caption);
        
        return $root[0];
    }

    $(function() {
        var $container = $('#container');

        $container.isotope({
            itemSelector : '.post',
            masonry: {
                columnWidth: 120
            }
        });
        
        $('#filters').on('click', 'a', function () {
            var selector = $(this).attr('data-filter');
            
            $container.isotope({ filter: selector });
            
            $filters.find('.selected').removeClass('selected');
            $(this).addClass('selected');
            
            return false;
        });
        
        _loadPosts(0, 10, function (newElements) {
            $container.isotope( 'insert', $(newElements) ); 
        });
    });

}(jQuery, window, window.document, window.beckysbrain.utils));