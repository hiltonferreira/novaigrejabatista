<?php
declare(strict_types=1);
if(!defined('NIB_EVENTOS_RUNTIME')){http_response_code(404);exit;}
function nibf_schema($raw):array {
 if(!is_array($raw)||count($raw)>30)throw new RuntimeException('Use até 30 perguntas personalizadas.');
 $out=[];$seen=[];
 foreach($raw as $f){
  if(!is_array($f))throw new RuntimeException('Pergunta inválida.');
  $id=(string)($f['id']??'');if(!preg_match('/^f_[a-z0-9_]{1,48}$/D',$id)||isset($seen[$id]))throw new RuntimeException('Identificador de pergunta inválido ou repetido.');$seen[$id]=true;
  $type=$f['type']??'';if(!in_array($type,['text','textarea','number','date','select','multiselect','checkbox'],true))throw new RuntimeException('Tipo de pergunta inválido.');
  $label=nibe_text($f['label']??'',120);if($label==='')throw new RuntimeException('Dê um título à pergunta.');
  if(!is_array($f['options']??[]))throw new RuntimeException('Opções inválidas.');$options=[];foreach(($f['options']??[]) as $v){$v=nibe_text($v,120);if($v!==''&&!in_array($v,$options,true))$options[]=$v;}
  if(count($options)>50||in_array($type,['select','multiselect'],true)&&!$options)throw new RuntimeException('Cadastre de 1 a 50 opções.');
  $out[]=['id'=>$id,'label'=>$label,'type'=>$type,'help'=>nibe_text($f['help']??'',300),'enabled'=>!empty($f['enabled']),'required'=>!empty($f['required']),'summary'=>!empty($f['summary']),'options'=>$options];
 }return $out;
}
function nibf_answers(array $schema,array $input):array {
 $out=[];foreach($schema as $f){if(!$f['enabled'])continue;$v=$input[$f['id']]??($f['type']==='multiselect'?[]:'');
 if($f['type']==='multiselect'){
  if(!is_array($v)||count($v)>50)throw new RuntimeException('Confira: '.$f['label']);
  $v=array_values(array_unique($v));foreach($v as $item)if(!is_string($item)||!in_array($item,$f['options'],true))throw new RuntimeException('Opção inválida: '.$f['label']);
 }else{
  if(!is_string($v)||strlen($v)>8000)throw new RuntimeException('Confira: '.$f['label']);$v=trim($v);
  if($v!==''&&$f['type']==='select'&&!in_array($v,$f['options'],true))throw new RuntimeException('Opção inválida: '.$f['label']);
  if($v!==''&&$f['type']==='number'&&!preg_match('/^-?\d{1,12}(?:[.,]\d{1,4})?$/D',$v))throw new RuntimeException('Número inválido: '.$f['label']);
  if($v!==''&&$f['type']==='checkbox'&&$v!=='yes')throw new RuntimeException('Resposta inválida: '.$f['label']);
  if($v!==''&&$f['type']==='date'){$d=DateTimeImmutable::createFromFormat('!Y-m-d',$v);if(!$d||$d->format('Y-m-d')!==$v)throw new RuntimeException('Data inválida: '.$f['label']);}
 }
 if($f['required']&&($v===''||$v===[]))throw new RuntimeException('Preencha: '.$f['label']);$out[$f['id']]=$v;
 }return $out;
}
function nibf_render(array $schema,array $values=[]):void {
 foreach($schema as $f){if(!$f['enabled'])continue;$n='answers['.$f['id'].']';$v=$values[$f['id']]??'';$required=$f['required']?' required':'';$label=nibe_h($f['label']);echo '<label>'.$label.($f['required']?' *':'');
 if($f['type']==='textarea')echo '<textarea name="'.$n.'" maxlength="8000"'.$required.'>'.nibe_h(is_string($v)?$v:'').'</textarea>';
 elseif(in_array($f['type'],['select','multiselect'],true)){$multi=$f['type']==='multiselect';echo '<select name="'.$n.($multi?'[]':'').'"'.($multi?' multiple':'').$required.'>';if(!$multi)echo '<option value="">Selecione</option>';foreach($f['options'] as $option){$selected=$multi?is_array($v)&&in_array($option,$v,true):$v===$option;echo '<option value="'.nibe_h($option).'"'.($selected?' selected':'').'>'.nibe_h($option).'</option>';}echo '</select>';}
 elseif($f['type']==='checkbox')echo '<input type="checkbox" name="'.$n.'" value="yes"'.($v==='yes'?' checked':'').$required.'>';
 else echo '<input name="'.$n.'" type="'.$f['type'].'"'.($f['type']==='number'?' step="any"':'').' value="'.nibe_h(is_string($v)?$v:'').'" maxlength="8000"'.$required.'>';
 if($f['help'])echo '<small>'.nibe_h($f['help']).'</small>';echo '</label>';
 }
}
function nibf_summary(array $row):string {
 $s='';foreach(($row['form_schema']??[]) as $f)if(!empty($f['summary'])&&isset($row['answers'][$f['id']])){$v=$row['answers'][$f['id']];$s.='<p><strong>'.nibe_h($f['label']).':</strong> '.nibe_h(is_array($v)?implode(', ',$v):($v==='yes'?'Sim':$v)).'</p>';}return $s;
}
