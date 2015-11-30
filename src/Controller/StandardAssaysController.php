<?php
namespace App\Controller;

use App\Controller\AppController;

/**
 * StandardAssays Controller
 *
 * @property \App\Model\Table\StandardAssaysTable $StandardAssays
 */
class StandardAssaysController extends AppController
{

    /**
     * Index method
     *
     * @return void
     */
    public function index()
    {
        $this->paginate = [
            'contain' => ['Attempts', 'Techniques', 'Standards']
        ];
        $this->set('standardAssays', $this->paginate($this->StandardAssays));
        $this->set('_serialize', ['standardAssays']);
    }

    /**
     * View method
     *
     * @param string|null $id Standard Assay id.
     * @return void
     * @throws \Cake\Network\Exception\NotFoundException When record not found.
     */
    public function view($id = null)
    {
        $standardAssay = $this->StandardAssays->get($id, [
            'contain' => ['Attempts', 'Techniques', 'Standards']
        ]);
        $this->set('standardAssay', $standardAssay);
        $this->set('_serialize', ['standardAssay']);
    }

    /**
     * Add method
     *
     * @return void Redirects on successful add, renders view otherwise.
     */
    public function add()
    {
        $standardAssay = $this->StandardAssays->newEntity();
        if ($this->request->is('post')) {
            $standardAssay = $this->StandardAssays->patchEntity($standardAssay, $this->request->data);
            if ($this->StandardAssays->save($standardAssay)) {
                $this->Flash->success(__('The standard assay has been saved.'));
                return $this->redirect(['action' => 'index']);
            } else {
                $this->Flash->error(__('The standard assay could not be saved. Please, try again.'));
            }
        }
        $attempts = $this->StandardAssays->Attempts->find('list', ['limit' => 200]);
        $techniques = $this->StandardAssays->Techniques->find('list', ['limit' => 200]);
        $standards = $this->StandardAssays->Standards->find('list', ['limit' => 200]);
        $this->set(compact('standardAssay', 'attempts', 'techniques', 'standards'));
        $this->set('_serialize', ['standardAssay']);
    }

    /**
     * Edit method
     *
     * @param string|null $id Standard Assay id.
     * @return void Redirects on successful edit, renders view otherwise.
     * @throws \Cake\Network\Exception\NotFoundException When record not found.
     */
    public function edit($id = null)
    {
        $standardAssay = $this->StandardAssays->get($id, [
            'contain' => []
        ]);
        if ($this->request->is(['patch', 'post', 'put'])) {
            $standardAssay = $this->StandardAssays->patchEntity($standardAssay, $this->request->data);
            if ($this->StandardAssays->save($standardAssay)) {
                $this->Flash->success(__('The standard assay has been saved.'));
                return $this->redirect(['action' => 'index']);
            } else {
                $this->Flash->error(__('The standard assay could not be saved. Please, try again.'));
            }
        }
        $attempts = $this->StandardAssays->Attempts->find('list', ['limit' => 200]);
        $techniques = $this->StandardAssays->Techniques->find('list', ['limit' => 200]);
        $standards = $this->StandardAssays->Standards->find('list', ['limit' => 200]);
        $this->set(compact('standardAssay', 'attempts', 'techniques', 'standards'));
        $this->set('_serialize', ['standardAssay']);
    }

    /**
     * Delete method
     *
     * @param string|null $id Standard Assay id.
     * @return \Cake\Network\Response|null Redirects to index.
     * @throws \Cake\Network\Exception\NotFoundException When record not found.
     */
    public function delete($id = null)
    {
        $this->request->allowMethod(['post', 'delete']);
        $standardAssay = $this->StandardAssays->get($id);
        if ($this->StandardAssays->delete($standardAssay)) {
            $this->Flash->success(__('The standard assay has been deleted.'));
        } else {
            $this->Flash->error(__('The standard assay could not be deleted. Please, try again.'));
        }
        return $this->redirect(['action' => 'index']);
    }
}
