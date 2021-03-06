define(function() {
    return {
        expression: {
            lengthRange: function(value, scope, element, attrs) {
                var range = attrs.range.split(',');
                if (value.length > range[0] && value.length < range[1]) {
                    return true;
                }
                return false;
            },
            optional: function() {
                return true;
            }
        },
        defaultMsg: {
            lengthRange: {
                error: 'length dont meet', // Todo: msg from attr info
                success: ''
            },
            optional: { // Todo: default msg?!
                error: '',
                success: ''
            }
        }
    }
})