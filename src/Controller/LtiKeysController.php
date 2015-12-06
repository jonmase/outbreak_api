<?php
namespace App\Controller;

use App\Controller\AppController;
use Cake\Event\Event;

/**
 * LtiKeys Controller
 *
 * @property \App\Model\Table\LtiKeysTable $LtiKeys
 */
class LtiKeysController extends AppController
{
	public function beforeFilter(Event $event) {
        parent::beforeFilter($event);
		$this->Auth->allow('login');
	}
	
	//LTI Login
	public function login() {
		if(isset($_REQUEST['lti_message_type']) && isset($_REQUEST['oauth_consumer_key'])) {	//Is this an LTI request
			require_once(ROOT . DS . 'vendor' . DS  . 'blti' . DS . 'blti.php');	//Load the BLTI class
			$session = $this->request->session();	//Set Session to variable
			//pr($session);
			$denied = ['controller' => 'pages', 'action' => 'display', 'denied'];	//Denied redirect
			$this->autoRender = false;	//Do not render a page

			//Find the key for the oauth_consumer_key, so we can get the secret
			$oauthConsumerKey = $_REQUEST['oauth_consumer_key'];
			$keysQuery = $this->LtiKeys->find('all', ['conditions' => ['oauth_consumer_key' => $oauthConsumerKey]]);
			$key = $keysQuery->first();
			//pr($key);
			
			if(empty($key)) {
				//There is no key that matches this oauth_consumer_key, so redirect to denied page
			    $this->redirect($denied);
			}
			
			//Create new BLTI object
			$context = new \BLTI($key->secret, true, false);
			//pr($context);
			
			//If context is complete (i.e. has it's own redirect), exit
			if ( $context->complete ) exit();
			
			//If context is not valid, send to denied page
			if ( !$context->valid ) {
			    $this->redirect($denied);
				exit;
			}
			
			if(isset($context->info['context_id'])) {
				$contextId = $context->info['context_id'];
			}
			else {
				$contextId = null;
			}
			
			//Check whether this context exists in the database
			$contextQuery = $this->LtiKeys->LtiContexts->find('all', ['conditions' => ['lti_context_id' => $contextId, 'lti_key_id' => $key->id]]);
			$savedContext = $contextQuery->first();
			//pr($savedContext);
			
			//Create or update the context
			if(empty($savedContext)) {
				//If there is no saved context matching the contextId and key ID, create one
				$contextData = $this->LtiKeys->LtiContexts->newEntity();

				$contextData->lti_key_id = $key->id;
				$contextData->lti_context_id = $contextId;
			}
			else {
				$contextData = $savedContext;
			}
			
			//Add/update the label and title
			$contextData->lti_context_label = $context->info['context_label'];
			$contextData->lti_context_title = $context->info['context_title'];
			//pr($contextData);
			
			//Save the context
			if ($this->LtiKeys->LtiContexts->save($contextData)) {
				//$this->Flash->success('The context has been saved');
				$session->write('LtiContext.id', $contextData->id);
			}
			else {
				//Save failed - redirect to access denied page
				$this->Flash->error('Context save failed');
				$this->redirect($denied);
				exit;
			}
			
			//Check whether there is a resource_link_id set in the LTI launch data
			if(isset($context->info['resource_link_id'])) {
				$resourceId = $context->info['resource_link_id'];
			}
			else {
				$resourceId = null;
			}
			
			//Check whether this resource exists in the database
			$resourceQuery = $this->LtiKeys->LtiResources->find('all', ['conditions' => ['lti_resource_link_id' => $resourceId, 'lti_key_id' => $key->id]]);
			$savedResource = $resourceQuery->first();
			//pr($savedContext);
			
			//Create or update the context
			if(empty($savedResource)) {
				//If there is no saved context matching the contextId and key ID, create one
				$resourceData = $this->LtiKeys->LtiResources->newEntity();

				$resourceData->lti_key_id = $key->id;
				$resourceData->lti_resource_link_id = $resourceId;
			}
			else {
				$resourceData = $savedResource;
			}
			
			//Add/update the label and title
			$resourceData->lti_resource_link_title = $context->info['resource_link_title'];
			$resourceData->lti_resource_link_description = !empty($context->info['resource_link_description'])?$context->info['resource_link_description']:null;
			//pr($resourceData);
			
			//Save the context
			if ($this->LtiKeys->LtiResources->save($resourceData)) {
				//$this->Flash->success('The resource has been saved');
				$session->write('LtiResource.id', $resourceData->id);
			}
			else {
				//Save failed - redirect to access denied page
				$this->Flash->error('Resource save failed');
				$this->redirect($denied);
				exit;
			}
			
			//Check whether there is a user_id set in the LTI launch data
			if(isset($context->info['user_id'])) {
				$userId = $context->info['user_id'];
			}
			else {
				//No user_id in launch data, so must be public user
				$userId = 'public_' . $context->info['resource_link_id'];
			}
			//Try to find a user who already exists with the key id and userId
			$userQuery = $this->LtiKeys->LtiUsers->find('all', ['conditions' => ['lti_user_id' => $userId, 'lti_key_id' => $key->id]]);
			$savedUser = $userQuery->first();
			
			if(empty($savedUser)) {
				//If there is no saved user matching the userId and key ID, create one
				$userData = $this->LtiKeys->LtiContexts->newEntity();

				$userData->lti_key_id = $key->id;
				$userData->lti_user_id = $userId;
			}
			else {
				$userData = $savedUser;
			}

			//Add/update the lti user data
			$userData->lti_eid = $context->info['lis_person_sourcedid'];
			$userData->lti_displayid = $context->info['ext_sakai_provider_displayid'];
			$userData->lti_roles = $context->info['roles'];
			$userData->lti_sakai_role = $context->info['ext_sakai_role'];
			$userData->lti_lis_person_contact_email_primary = $context->info['lis_person_contact_email_primary'];
			$userData->lti_lis_person_name_family = $context->info['lis_person_name_family'];
			$userData->lti_lis_person_name_full = $context->info['lis_person_name_full'];
			$userData->lti_lis_person_name_given = $context->info['lis_person_name_given'];
			//pr($userData);

			if($this->LtiKeys->LtiUsers->save($userData)) {
				//$this->Flash->success('The user has been saved');
				$this->Auth->setUser($userData->toArray());
				//$session->write('User', $userData);	//Add user to Session. Read using $this->Session->read('user')
			}
			else {
				//Save failed - redirect to access denied page
				$this->Flash->error('User save failed');
				$this->redirect($denied);
				exit;
			}

			
			//pr($session->read());
			//exit;
			$this->redirect(['controller' => 'attempts', 'action' => 'index']);
			//exit;
		}
		else {
			//pr("Not an LTI request");
			$this->Flash->error('This application can only be accessed using an LTI launch');
			$this->redirect($denied);
		}
	}

    /**
     * Index method
     *
     * @return void
     */
    public function index()
    {
        $this->set('ltiKeys', $this->paginate($this->LtiKeys));
        $this->set('_serialize', ['ltiKeys']);
    }

    /**
     * View method
     *
     * @param string|null $id Lti Key id.
     * @return void
     * @throws \Cake\Network\Exception\NotFoundException When record not found.
     */
    public function view($id = null)
    {
        $ltiKey = $this->LtiKeys->get($id, [
            'contain' => ['LtiContexts', 'LtiResources', 'LtiUsers']
        ]);
        $this->set('ltiKey', $ltiKey);
        $this->set('_serialize', ['ltiKey']);
    }

    /**
     * Add method
     *
     * @return void Redirects on successful add, renders view otherwise.
     */
    public function add()
    {
        $ltiKey = $this->LtiKeys->newEntity();
        if ($this->request->is('post')) {
            $ltiKey = $this->LtiKeys->patchEntity($ltiKey, $this->request->data);
            if ($this->LtiKeys->save($ltiKey)) {
                $this->Flash->success(__('The lti key has been saved.'));
                return $this->redirect(['action' => 'index']);
            } else {
                $this->Flash->error(__('The lti key could not be saved. Please, try again.'));
            }
        }
        $this->set(compact('ltiKey'));
        $this->set('_serialize', ['ltiKey']);
    }

    /**
     * Edit method
     *
     * @param string|null $id Lti Key id.
     * @return void Redirects on successful edit, renders view otherwise.
     * @throws \Cake\Network\Exception\NotFoundException When record not found.
     */
    public function edit($id = null)
    {
        $ltiKey = $this->LtiKeys->get($id, [
            'contain' => []
        ]);
        if ($this->request->is(['patch', 'post', 'put'])) {
            $ltiKey = $this->LtiKeys->patchEntity($ltiKey, $this->request->data);
            if ($this->LtiKeys->save($ltiKey)) {
                $this->Flash->success(__('The lti key has been saved.'));
                return $this->redirect(['action' => 'index']);
            } else {
                $this->Flash->error(__('The lti key could not be saved. Please, try again.'));
            }
        }
        $this->set(compact('ltiKey'));
        $this->set('_serialize', ['ltiKey']);
    }

    /**
     * Delete method
     *
     * @param string|null $id Lti Key id.
     * @return \Cake\Network\Response|null Redirects to index.
     * @throws \Cake\Network\Exception\NotFoundException When record not found.
     */
    public function delete($id = null)
    {
        $this->request->allowMethod(['post', 'delete']);
        $ltiKey = $this->LtiKeys->get($id);
        if ($this->LtiKeys->delete($ltiKey)) {
            $this->Flash->success(__('The lti key has been deleted.'));
        } else {
            $this->Flash->error(__('The lti key could not be deleted. Please, try again.'));
        }
        return $this->redirect(['action' => 'index']);
    }
}