import _ from 'lodash';
import isPhone from 'phone-regex';

/* @ngInject */
function identitySection(authentication, editorModel, gettextCatalog, notification, signatureModel, tools, dispatchers) {

    const I18N = {
        SUCCESS_SAVE: gettextCatalog.getString('Default Name / Signature saved', null, "User's signature")
    };
    const EDITOR_ID = 'signature';
    const MULTIPLE_ADDRESS_CLASS = 'identitySection-has-multiple-address';

    /**
     * Find if there is a phone number inside the signature and replace it with
     * an anchor.
     * @param  {String} input Signature
     * @return {String}
     */
    const bindPhone = (input = '') => {
        if (/tel:/.test(input)) {
            return input;
        }
        return input.replace(isPhone(), (match) => {
            return ` <a href="tel:${match.trim()}">${match.trim()}</a>`;
        });
    };

    return {
        scope: {},
        replace: true,
        restrict: 'E',
        templateUrl: require('../../../templates/user/identitySection.tpl.html'),
        link(scope, el) {
            const CACHE = {};
            const $form = el.find('[name="identityForm"]');

            const { on, unsubscribe } = dispatchers();

            const updateAddress = ({ ID, DisplayName, Signature }, firstTime = false) => {
                const signature = tools.replaceLineBreaks(Signature);

                CACHE.ID = ID;

                if (!firstTime) {
                    const { editor } = editorModel.find({ ID: EDITOR_ID });
                    editor.fireEvent('refresh', { Body: signature });
                }

                scope.address = { DisplayName, Signature: signature };
            };

            const updateUser = () => {
                const { Addresses = [] } = authentication.user || {};
                CACHE.addresses = Addresses.slice(0);
                el[0].classList[CACHE.addresses.length > 1 ? 'add' : 'remove'](MULTIPLE_ADDRESS_CLASS);
            };

            const onSubmit = async () => {
                const { DisplayName, Signature } = scope.address;
                const config = {
                    ID: CACHE.ID,
                    DisplayName,
                    Signature: bindPhone(Signature)
                 };
                await signatureModel.save(config);
                notification.success(I18N.SUCCESS_SAVE);
                updateAddress(config);
            };

            $form.on('submit', onSubmit);

            on('changeAddressSelection', (event, { ID }) => {
                const address = _.find(CACHE.addresses, { ID });

                if (address) {
                    scope.$applyAsync(() => {
                        updateAddress(address);
                    });
                }
            });

            on('updateUser', updateUser);

            updateUser();
            updateAddress(CACHE.addresses[0], true);

            scope.$on('$destroy', () => {
                $form.off('submit', onSubmit);
                unsubscribe();
            });
        }
    };
}
export default identitySection;
