(function ($, window, document, utils) {

    var _baseTumblrPostsApiUrl = 'http://api.tumblr.com/v2/blog/beckysbrain.tumblr.com/posts',
        _tumblrApiKey = 'X9UXZNouFnf2rJSR0hpKlUed3E5ssvnVTylwhOOrEUOEbgGVcN',
        _offset = 0,
        _count = 10,
        _titleLength = 25,
        _appendText = '...',
        _tagCache = [],
        $tagFilters = $('#tag-filters'),
        $typeFilters = $('#type-filters');

    function _normalizeTagName(tagName) {
        return tagName.replace(/[^aA-zZ0-9]/gi, '');
    }
        
    function _addTag(tagName, normalizedTagName) {
        _tagCache.push(normalizedTagName);
        _addTagFilter(tagName, normalizedTagName);
    }
    
    function _addTagFilter(tagName, normalizedTagName) {
        var $filterItem = $('<option />');
            
        $filterItem.attr('data-filter', '.' + normalizedTagName);
        $filterItem.text(tagName);
        
        $tagFilters.append($filterItem);
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
                url: _baseTumblrPostsApiUrl,
                dataType: 'jsonp',
                jsonp: 'jsonp',
                data: {
                    api_key: _tumblrApiKey,
                    offset: start,
                    limit: count
                }
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
                
            case 'audio':
                post = _buildAudioPost(postData);
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
            date = null,
            colorString = utils.generateRandomColor();
        
        $root.addClass('post');
        $root.css('background-color', colorString);
        $root.attr('data-date', postData.date);
        $root.attr('data-timestamp', postData.timestamp);
        $root.attr('data-id', postData.id);
        $root.attr('data-post-url', postData.post_url);
        $root.attr('data-post-type', postData.type);
        
        date = new Date(postData.date);
        $date.text(date.formatDate() + ' ' + date.formatTime(true));
        
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
            $body = $root.find('.body'),
            $link = $('<a />');
        
        $root.addClass('quadwide tripletall');
        
        $link.attr('href', postData.post_url);
        $link.html(postData.title);
        $title.append($link);
        $body.html(postData.body);
        
        return $root[0];
    }
    
    function _buildPhotoPost(postData) {
        var $root = _buildBasePost(postData),
            $title = $root.find('.title'),
            $body = $root.find('.body'),
            $anchor = null,
            $thumb = null,
            titleText = utils.decodeHtml(postData.caption),
            $link = $('<a />');
        
        $root.addClass('doublewide doubletall');

        $link.attr('href', postData.post_url);
        $link.text(utils.truncateString(titleText, _titleLength));
        $title.append($link);
        
        $.each(postData.photos, function (idx, el) {
            $thumb = $('<img />');
            $thumb.attr('src', el.alt_sizes[el.alt_sizes.length-1].url);
            
            $anchor = $('<a />');
            $anchor.attr('href', el.original_size.url);
            
            $anchor.append($thumb);
            $body.append($anchor);
        });
        
        $body.append(postData.caption);
        
        return $root[0];
    }
    
    function _buildAudioPost(postData) {
        var $root = _buildBasePost(postData),
            $title = $root.find('.title'),
            $body = $root.find('.body'),
            $link = $('<a />'),
            titleText = utils.decodeHtml(postData.caption);
        
        $root.addClass('doublewide doubletall');
        
        $link.attr('href', postData.post_url);
        $link.html(utils.truncateString(titleText, _titleLength));
        $title.append($link);
        
        $body.append(postData.player);
        $body.append(postData.caption);
        
        return $root[0];
    }
    
    var tumblr = {
    
        run: function () {
            var $container = $('#container');

            $container.isotope({
                itemSelector : '.post',
                masonry: {
                    columnWidth: 130
                }
            });
            
            $tagFilters.on('change', function () {
                var selector = $(this).find(':selected').attr('data-filter');
                
                $container.isotope({ filter: selector });
            });
            
            $typeFilters.on('click', 'a', function () {
                var selector = $(this).attr('data-filter');
                
                $container.isotope({ filter: selector });
                
                $typeFilters.find('.selected').removeClass('selected');
                $(this).addClass('selected');
                
                return false;
            });
            
            $('#load-more').on('click', function () {
                _offset += 10;

                _loadPosts(_offset, _count, function (newElements) {
                    $container.isotope( 'insert', $(newElements) ); 
                });
                
                return false;
            });
            
            _loadPosts(_offset, _count, function (newElements) {
                $container.isotope( 'insert', $(newElements) ); 
            });
        }
        
    };
    
    if (!window.beckysbrain) {
        window.beckysbrain = {};
    }
    window.beckysbrain.tumblr = tumblr;
    
    tumblr.run();

}(jQuery, window, window.document, window.beckysbrain.utils));