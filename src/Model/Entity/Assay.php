<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Assay Entity.
 *
 * @property int $id
 * @property int $attempt_id
 * @property \App\Model\Entity\Attempt $attempt
 * @property int $technique_id
 * @property \App\Model\Entity\Technique $technique
 * @property int $site_id
 * @property \App\Model\Entity\Site $site
 * @property int $school_id
 * @property \App\Model\Entity\School $school
 * @property int $child_id
 * @property \App\Model\Entity\Child $child
 * @property int $sample_stage_id
 * @property \App\Model\Entity\SampleStage $sample_stage
 * @property bool $before_submit
 * @property \Cake\I18n\Time $created
 * @property \Cake\I18n\Time $modified
 */
class Assay extends Entity
{

    /**
     * Fields that can be mass assigned using newEntity() or patchEntity().
     *
     * Note that when '*' is set to true, this allows all unspecified fields to
     * be mass assigned. For security purposes, it is advised to set '*' to false
     * (or remove it), and explicitly make individual fields accessible as needed.
     *
     * @var array
     */
    protected $_accessible = [
        '*' => true,
        'id' => false,
    ];
}
