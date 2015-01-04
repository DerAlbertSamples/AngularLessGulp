module directives {
    
    function styleButton(element, attrs) {
        if (!element.hasClass('btn')) {
            return;
        }
        element.attr('role', 'button');

        if (attrs.type == 'submit') {
            element.addClass('btn-primary');
        }

        if (attrs.size) {
            element.addClass('btn-' + attrs.size);
        }

        if (attrs.level) {
            element.addClass('btn-' + attrs.level);
        } else {
            if (!element.hasClass('btn-primary')) {
                element.addClass('btn-default');
            }
        }
    }

    function buttonDirective():ng.IDirective {

        function compile(element, attrs) {
            element.addClass('btn');
            styleButton(element, attrs);
            return null;
        }

        return {
            restrict: 'EA',
            compile: compile
        }
    }

    function inputButtonDirective():ng.IDirective {
        function compile(element, attrs) {
            if (attrs.type === 'button' || attrs.type === 'submit' || attrs.type === 'reset') {
                element.addClass('btn');
            }

            styleButton(element, attrs);
            return null;
        }

        return {
            restrict: 'E',
            compile: compile
        }
    }


    angular.module('da.directives.buttons', [])
        .directive('button', buttonDirective)
        .directive('input', inputButtonDirective);
}
